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
	path = require('upath');

const
	{config: pzlr} = require('@pzlr/build-core'),
	aliases = include('build/alias.webpack');

const
	contextRgxp = /\/\/\s*@context:\s*(.*?)\n([\s\S]*?)\/\/\s*@endcontext\n/g,
	tplRgxp = /\/?\${(.*?)}/g;

/**
 * Monic replacer to enable require.context declarations through multiple contexts
 *
 * @param {string} str
 * @returns {string}
 *
 * @example
 * ```js
 * // @context: ['@sprite', ['./assets', './node_modules/a/assets']]
 * console.log(require.context('!!svg-sprite!@sprite', true, /\.svg$/));
 * // @endcontext
 *
 * // The declaration will be transformed to
 *
 * console.log(require.context('!!svg-sprite-loader!./assets', true, /\.svg$/));
 * console.log(require.context('!!svg-sprite-loader!./node_modules/a/assets', true, /\.svg$/));
 *
 * // Also, you can take values that are passed as monic flags
 *
 * // @context: ['@sprite', 'sprite' in flags ? flags.sprite : '@super']
 * console.log(require.context('!!svg-sprite-loader!@sprite', true, /\.svg$/));
 * // @endcontext
 * ```
 */
module.exports = function requireContextReplacer(str) {
	return str.replace(contextRgxp, (str, values, body) => {
		// eslint-disable-next-line no-new-func
		values = Function('flags', `return ${values}`)(this.flags);

		if (!Object.isArray(values) || values.length < 2) {
			throw SyntaxError('Invalid @context format');
		}

		let
			res = '';

		const
			rgxp = new RegExp(`(['"!])(${RegExp.escape(values[0])})(?=['"])`, 'g'),
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

				const res = body.replace(rgxp, (str, $1, url) => {
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
						let
							v = $C(config).get(key);

						if (Object.isFunction(v)) {
							v = v();
						}

						return v ? `/${v}` : v;
					});

					if (fs.existsSync(src)) {
						exists = true;
					}

					return path.normalize($1 + src);
				});

				if (exists) {
					wrap(res);
				}
			}
		});

		return res;
	});
};

Object.assign(module.exports, {
	contextRgxp,
	tplRgxp
});
