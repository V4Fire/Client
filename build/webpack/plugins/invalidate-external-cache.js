/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

'use strict';

const {removeFromCache: cleanStylusInheritanceCache} = require('@pzlr/stylus-inheritance');

module.exports = class InvalidateExternalCachePlugin {
	/**
	 * This plugin invalidates the external cache for modified files in webpack watch mode
	 * @param {import('webpack').Compiler} compiler
	 */
	apply(compiler) {
		compiler.hooks.watchRun.tap('InvalidateExternalCachePlugin', (compiler) => {
			if (compiler.modifiedFiles != null) {
				cleanStylusInheritanceCache(compiler.modifiedFiles);
			}
		});
	}
};
