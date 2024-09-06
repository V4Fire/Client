/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

'use strict';

/**
 * Webpack plugin to ignore invalid warnings during building
 */
module.exports = class IgnoreInvalidWarningsPlugin {
	/**
	 * @param {import('webpack').Compiler} compiler
	 */
	apply(compiler) {
		compiler.hooks.done.tap('IgnoreInvalidWarningsPlugin', doneHook);

		compiler.hooks.infrastructureLog.tap('IgnoreInvalidWarningsPlugin', infrastructureLogHook);

		function doneHook() {
			// FIXME: unable to modify in rspack
			// stats.compilation.warnings = stats.compilation.warnings.filter((warn) => {
			// 	switch (warn.constructor.name) {
			// 		// @see https://github.com/TypeStrong/ts-loader/issues/653
			// 		// @see https://github.com/jaredwray/keyv/issues/45
			// 		case 'ModuleDependencyWarning':
			// 			return !/export '.*'( \(reexported as '.*'\))? was not found in/.test(warn.message) &&
			// 						!/Critical dependency: the request of a dependency is an expression/.test(warn.message);

			// 		// `require.context` goes fucking crazy :(
			// 		case 'ModuleNotFoundError':
			// 			return !/Can't resolve '(?:rc|ode_modules)/.test(warn.message);

			// 		default:
			// 			return true;
			// 	}
			// });
		}

		function infrastructureLogHook(origin, type, args) {
			switch (origin) {
				case 'webpack.cache.PackFileCacheStrategy/webpack.FileSystemInfo':
					// Specifying `snapshot.managedPaths` with excluded libs generates warnings
					// even with the example regexp from the docs
					// @see https://webpack.js.org/configuration/other-options/#managedpaths
					if (
						Object.isString(args[0]) &&
						type === 'warn' &&
						/Managed item .*? isn't a directory or doesn't contain a package.json/.test(args[0])
					) {
						return false;
					}

					break;

				default:
			}
		}
	}
};
