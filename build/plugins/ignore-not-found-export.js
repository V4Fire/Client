'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * @see https://github.com/TypeStrong/ts-loader/issues/653
 */
module.exports = class IgnoreNotFoundExportPlugin {
	apply(compiler) {
		const
			warningRgxp = /export '.*'( \(reexported as '.*'\))? was not found in/;

		const doneHook = (stats) =>
			stats.compilation.warnings = stats.compilation.warnings.filter((warn) =>
				!(warn.constructor.name === 'ModuleDependencyWarning' && warningRgxp.test(warn.message)));

		compiler.hooks.done.tap('IgnoreNotFoundExportPlugin', doneHook);
	}
};
