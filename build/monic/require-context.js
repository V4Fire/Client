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
	config = require('@config/config');

const
	fs = require('fs'),
	path = require('upath');

const
	{config: pzlr} = require('@pzlr/build-core'),
	aliases = include('build/webpack/alias');

const
	contextRgxp = /\/\/\s*@context:\s*(.*?)\n([\s\S]*?)\/\/\s*@endcontext\n/g,
	tplRgxp = /\/?\${(.*?)}/g;

/**
 * Monic replacer to enable `require.context` declarations through multiple contexts
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
	return str.replace(contextRgxp, (str, context, body) => {
		// eslint-disable-next-line no-new-func
		context = Function('flags', `return ${context}`)(this.flags);

		if (!Object.isArray(context) || context.length < 2) {
			throw SyntaxError('Invalid @context format');
		}

		let
			res = '';

		const
			rgxp = new RegExp(`(['"!])(${RegExp.escape(context[0])})(?=['"])`, 'g'),
			wrap = (str) => res += `\n(() => {\n${str}\n})();\n`;

		context = context.slice(1).map((el) => {
			if (el === pzlr.super) {
				return pzlr.dependencies;
			}

			return el;
		});

		[''].concat(...context).forEach((paths) => {
			if (paths == null) {
				return;
			}

			paths = paths || [];

			let
				exists = false;

			const res = body.replace(rgxp, (str, $1, src) => {
				let
					resolvedSrc;

				if (src[0] === '@') {
					const
						parts = src.split('/'),
						key = [].concat(paths, parts[0].slice(1)).join('/');

					if (!aliases[key]) {
						return str;
					}

					resolvedSrc = [aliases[key], ...parts.slice(1)].join('/');

				} else {
					resolvedSrc = [].concat(paths, src).join('/');
				}

				resolvedSrc = resolvedSrc.replace(tplRgxp, (str, key) => {
					let
						v = $C(config).get(key);

					if (Object.isFunction(v)) {
						v = v();
					}

					return v ? `/${v}` : v;
				});

				if (fs.existsSync(resolvedSrc)) {
					exists = true;
				}

				return $1 + path.normalize(resolvedSrc);
			});

			if (exists) {
				wrap(res);
			}
		});

		return res;
	});
};

Object.assign(module.exports, {
	contextRgxp,
	tplRgxp
});
