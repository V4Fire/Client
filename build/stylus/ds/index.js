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
	{theme} = config.runtime(),
	{DS} = include('build/stylus/ds/const'),
	{getDS} = include('build/ds');

if (pzlr.config.designSystem) {
	const
		designSystem = getDS();

	if (Object.isObject(designSystem)) {
		Object.assign(DS, createDesignSystem(designSystem));

	} else {
		console.log('[stylus] Design system must be an object');
	}

} else {
	console.log('[stylus] Design system package is not specified');
}

module.exports = include('build/stylus/ds/plugins');
