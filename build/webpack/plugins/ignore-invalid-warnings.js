'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * Webpack plugin to ignore invalid warnings during building
 */
module.exports = class IgnoreInvalidWarningsPlugin {
	apply(compiler) {
		compiler.hooks.done.tap('IgnoreInvalidWarningsPlugin', doneHook);

		function doneHook(stats) {
			stats.compilation.warnings = stats.compilation.warnings.filter((warn) => {
				switch (warn.constructor.name) {
					// @see https://github.com/TypeStrong/ts-loader/issues/653
					case 'ModuleDependencyWarning':
						return !/export '.*'( \(reexported as '.*'\))? was not found in/.test(warn.message);

					// `require.context` goes fucking crazy :(
					case 'ModuleNotFoundError':
						return !/Can't resolve '(?:rc|ode_modules)/.test(warn.message);

					default:
						return true;
				}
			});
		}
	}
};
