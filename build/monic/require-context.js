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
	fs = require('node:fs'),
	path = require('upath');

const
	{config: pzlr} = require('@pzlr/build-core');

const
	aliases = include('build/webpack/resolve/alias');

const
	contextRgxp = /\/\/\s*@context:\s*(.*?)\n([\S\s]*?)\/\/\s*@endcontext\n/g,
	tplRgxp = /\/?\${(.*?)}/g;

/**
 * A Monic replacer that enables `require.context` declarations through multiple contexts
 *
 * @param {string} str
 * @returns {string}
 *
 * The following transformation rules are used:
 *
 * 0. The token will be substituted with itself (without the `@` prefix).
 * 1. If the path starts with the webpack alias, the path will be substituted as is.
 * 2. Else, if the token starts with the `@` prefix, the provided path will
 *    be concatenated with the token (without the prefix) and substituted.
 * 3. Else, the provided path will be concatenated with the token and substituted.
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
 * Then, the following code:
 *
 * ```js
 * // @context: ['@sprite', ['@v4fire/core', '@v4fire/client', 'ds/icons', 'ds/bla']]
 * console.log(require.context('!!svg-sprite!@sprite', true, /\.svg$/));
 * // @endcontext
 * ```
 *
 * Will be transformed to:
 *
 * ```js
 * console.log(require.context('!!svg-sprite!sprite', true, /\.svg$/));
 * console.log(require.context('!!svg-sprite!@v4fire/client/sprite', true, /\.svg$/));
 * console.log(require.context('!!svg-sprite!ds/icons', true, /\.svg$/));
 * // There is no alias for `@v4fire/core/sprite`, so the resolution is not included in the build
 * // The path `ds/bla` does not exist, so the resolution is not included in the build
 * ```
 *
 * Also, you can take values that are passed as monic flags:
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
					resolvedSrc;

				if (getAliasFromPath(contextPath) != null) {
					resolvedSrc = contextPath;

				} else if (src[0] === '@') {
					resolvedSrc = path.join(contextPath, src.slice(1));

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

				isPathExists = checkFileExists(resolvedSrc);

				return path.normalize(resolvedSrc);
			});

			if (isPathExists) {
				wrapWithIIFE(res);
			}
		});

		return res;
	});
};

/**
 * Checks if a file exists at the given path
 *
 * @param {string} pathToCheck
 * @returns {boolean}
 *
 * @example
 * ```js
 * checkFileExists('/foo/bla/bar'); // checks an absolute path
 * checkFileExists('bla/bar');      // checks webpack aliases
 * ```
 */
function checkFileExists(pathToCheck) {
	if (path.isAbsolute(pathToCheck)) {
		return fs.existsSync(pathToCheck);
	}

	const alias = getAliasFromPath(pathToCheck);

	if (alias == null) {
		return false;
	}

	const
		resolvedAlias = aliases[alias],
		pathWithoutAlias = pathToCheck.replace(alias, ''),
		resolvedPath = path.join(resolvedAlias, pathWithoutAlias);

	if (path.isAbsolute(resolvedPath)) {
		return fs.existsSync(resolvedPath);
	}

	const pathToDep = path.dirname(require.resolve(path.join(aliases[alias], 'package.json')));

	return fs.existsSync(path.join(pathToDep, pathWithoutAlias));
}

/**
 * Retrieves the alias from a given path
 *
 * @param {string} path - the path to retrieve the alias from
 * @returns {(string|undefined)}
 */
function getAliasFromPath(path) {
	let alias;

	for (const a of Object.keys(aliases)) {
		if (path.startsWith(a)) {
			alias = a;
			break;
		}
	}

	return alias;
}

Object.assign(module.exports, {
	contextRgxp,
	tplRgxp
});
