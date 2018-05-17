'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
	$C = require('collection.js'),
	config = require('config'),
	fs = require('fs');

const
	{config: pzlr} = require('@pzlr/build-core'),
	aliases = include('build/alias.webpack');

const
	contextRgxp = /\/\/\s*@context:\s*(.*?)\n([\s\S]*?)\/\/\s*@endcontext\n/g,
	tplRgxp = /\/?\${(.*?)}/g;

/**
 * Monic replacer for require.context declarations
 *
 * @param {string} str
 * @returns {string}
 */
module.exports = function (str) {
	return str.replace(contextRgxp, (str, values, body) => {
		values = new Function('flags', `return ${values}`)(this);

		if (!Object.isArray(values) || values.length < 2) {
			throw SyntaxError('Invalid @context format');
		}

		let
			res = '';

		const
			rgxp = new RegExp(`('|"|!)(${RegExp.escape(values[0])})(?='|")`, 'g'),
			wrap = (str) => res += `\n(() => {\n${str}\n})();\n`;

		values = values.slice(1).map((el) => {
			if (el === pzlr.super) {
				return pzlr.dependencies;
			}

			return el;
		});

		[''].concat(...values).forEach((el) => {
			if (el != null) {
				let
					exists = false;

				body = body.replace(rgxp, (str, $1, url) => {
					let
						src;

					if (url[0] === '@') {
						const
							parts = url.split('/'),
							key = [].concat(el || [], parts[0].slice(1)).join('/');

						if (!aliases[key]) {
							return str;
						}

						src = [aliases[key], ...parts.slice(1)].join('/');

					} else {
						src = [].concat(el || [], url).join('/');
					}

					src = src.replace(tplRgxp, (str, key) => {
						let v = $C(config).get(key);

						if (Object.isFunction(v)) {
							v = v();
						}

						return v ? `/${v}` : v;
					});

					if (fs.existsSync(src)) {
						exists = true;
					}

					return $1 + src;
				});

				if (exists) {
					wrap(body);
				}
			}
		});

		return res;
	});
};
