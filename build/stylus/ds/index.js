'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
	config = require('config'),
	pzlr = require('@pzlr/build-core'),
	createDesignSystem = include('build/stylus/ds/init'),
	{theme} = config.runtime();

if (pzlr.config.designSystem) {
	try {
		createDesignSystem(require(pzlr.config.designSystem), theme, config.includeThemes());

	} catch {
		console.log(`[stylus] Can't find "${pzlr.config.designSystem}" design system package`);
	}

} else {
	console.log('[stylus] Design system package is not specified');
}

module.exports = include('build/stylus/ds/plugins');
