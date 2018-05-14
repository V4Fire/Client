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
	config = require('config');

const
	fs = require('fs'),
	path = require('path');

const
	{config: pzlr, resolve} = require('@pzlr/build-core'),
	{normalizeSep} = include('build/helpers');

const
	aliases = include('build/alias.webpack'),
	deps = [pzlr.super, ...pzlr.dependencies].map((el) => RegExp.escape(el || el.src));

const
	importRgxp = new RegExp(`('|")(${deps.join('|')})(.*?)\\1`, 'g'),
	contextRgxp = /\/\/\s*@context:\s*(.*?)\n([\s\S]*?)\/\/\s*@endcontext\n/g,
	tplRgxp = /\/?\${(.*?)}/g;

/**
 * Monic replacer for TS import declarations
 *
 * @param {string} str
 * @param {string} file
 * @returns {string}
 */
module.exports = function (str, file) {
	if (!deps.length) {
		return str;
	}

	str = str.replace(contextRgxp, (str, values, body) => {
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

						src = [aliases[key], ...parts.slice(1)].join('/');

					} else {
						src = [].concat(el || [], url).join('/');
					}

					src = src.replace(tplRgxp, (str, key) => {
						const v = $C(config).get(key);
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

	return str.replace(importRgxp, (str, $1, root, url) => {
		let
			resource;

		if (pzlr.superRgxp.test(root)) {
			for (let deps = resolve.rootDependencies, i = 0; i < deps.length; i++) {
				const
					el = deps[i],
					l = path.join(el, url);

				if (fs.existsSync(l)) {
					resource = l;
					break;
				}
			}
		}

		if (!resource && resolve.depMap[root]) {
			resource = path.join(config.src.lib(), root, resolve.depMap[root].config.sourceDir, url);
		}

		if (resource) {
			return `'${normalizeSep(path.relative(path.dirname(file), resource))}'`;
		}

		return str;
	});
};
