'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
	config = require('@config/config');

const
	fs = require('fs'),
	path = require('upath');

const
	{config: pzlr} = require('@pzlr/build-core');

const
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
	return str.replace(contextRgxp, (str, contextPaths, wrappedCode) => {
		// eslint-disable-next-line no-new-func
		contextPaths = Function('flags', `return ${contextPaths}`)(this.flags);

		if (!Object.isArray(contextPaths) || contextPaths.length < 2) {
			throw SyntaxError('Invalid @context format');
		}

		let
			res = '';

		const
			contextVarRgxp = new RegExp(`(?<=['"!])(${RegExp.escape(contextPaths[0])})(?=['"])`, 'g'),
			wrapWithIIFE = (str) => res += `\n(() => {\n${str}\n})();\n`;

		contextPaths = contextPaths.slice(1).flatMap((el) => {
			if (el === pzlr.super) {
				return pzlr.dependencies;
			}

			return el;
		});

		['', ...contextPaths].forEach((contextPath) => {
			if (contextPath == null) {
				return;
			}

			let
				isPathExists = false;

			const res = wrappedCode.replace(contextVarRgxp, (str, src) => {
				let
					resolvedSrc;

				if (src[0] === '@') {
					const
						srcChunks = src.split(/[\\/]/),
						key = path.join(contextPath, srcChunks[0].slice(1));

					if (!aliases[key]) {
						return str;
					}

					resolvedSrc = path.join(aliases[key], ...srcChunks.slice(1));

				} else {
					resolvedSrc = path.join(contextPath, src);
				}

				// Interpolate templates from the path string
				resolvedSrc = resolvedSrc.replace(tplRgxp, (str, key) => {
					let
						v = Object.get(config, key);

					if (Object.isFunction(v)) {
						v = v();
					}

					return v ? `/${v}` : v;
				});

				if (fs.existsSync(resolvedSrc)) {
					isPathExists = true;
				}

				return path.normalize(resolvedSrc);
			});

			if (isPathExists) {
				wrapWithIIFE(res);
			}
		});

		return res;
	});
};

Object.assign(module.exports, {
	contextRgxp,
	tplRgxp
});
