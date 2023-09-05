/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

'use strict';

const
	config = require('@config/config');

const
	fs = require('fs'),
	path = require('upath');

const
	{config: pzlr} = require('@pzlr/build-core');

const
	aliases = include('build/webpack/resolve/alias');

const
	contextRgxp = /\/\/\s*@context:\s*(.*?)\n([\s\S]*?)\/\/\s*@endcontext\n/g,
	tplRgxp = /\/?\${(.*?)}/g;

/**
 * Monic replacer to enable `require.context` declarations through multiple contexts
 *
 * @param {string} str
 * @returns {string}
 *
 * The following transformation rules are used:
 *
 * 0. The token will be substituted with itself (without the `@` prefix).
 * 1. If the path starts with the webpack alias, the path will be replaced as is with the resolved alias.
 * 2. Else, if the token starts with the `@` prefix, the provided path will
 * be concatenated with the token (without the prefix) and resolved as the webpack alias, if the alias exists.
 * 3. Else, the provided path will be concatenated with the token.
 *
 * In all cases, there is a check to ensure that the file exists at the resulting path.
 * If the file does not exist, the substitution will not be made.
 *
 * @example
 * Suppose the following aliases are defined in the webpack config:
 *
 * ```js
 * const aliases = {
 *   ds: '/path1',
 *   '@v4fire/client/sprite': '/path2',
 *   sprite: '/path3'
 * };
 * ```
 *
 * Then, the following construct:
 *
 * ```js
 * // @context: ['@sprite', ['@v4fire/core', '@v4fire/client', 'ds/icons', 'ds/bla']]
 * console.log(require.context('!!svg-sprite!@sprite', true, /\.svg$/));
 * // @endcontext
 * ```
 *
 * Will be transformed into the following fragment:
 *
 * ```js
 * console.log(require.context('!!svg-sprite!/path3', true, /\.svg$/)); // resolved alias `sprite`
 * console.log(require.context('!!svg-sprite!/path2', true, /\.svg$/)); // resolved alias `@v4fire/client/sprite`
 * console.log(require.context('!!svg-sprite!/path1/icons', true, /\.svg$/)); // resolved alias `ds` and substituted path `icons`
 * // There is no alias for `@v4fire/core/sprite`, so the resolution is not included in the build
 * // The path `/path1/bla` does not exist, so the resolution is not included in the build
 * ```
 *
 * Also, you can take values that are passed as monic flags
 *
 * ```js
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
				return contextPaths[0].startsWith('@') ? pzlr.dependencies : config.src.roots;
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
					resolvedSrc,
					alias;

				for (let e of aliases) {
					if (contextPath.startsWith(e)) {
						alias = e;
						break;
					}
				}

				if (alias != null) {
					resolvedSrc = path.resolve(path.join(aliases[alias], contextPath.replace(alias, '')));

				} else if (src[0] === '@') {
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
