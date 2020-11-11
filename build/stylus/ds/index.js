'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
	pzlr = require('@pzlr/build-core'),
	config = require('config');

const
	{createDesignSystem} = include('build/stylus/ds/helpers'),
	createPlugins = include('build/stylus/ds/plugins'),
	{getDS} = include('build/ds');

const
	{theme, includeThemes, 'ds/include-vars': includeVars} = config.runtime();

let
	ds = {},
	cssVariables = {};

if (pzlr.config.designSystem) {
	const
		designSystem = getDS();

	if (Object.isObject(designSystem)) {
		const
			{data, variables} = createDesignSystem(designSystem);

		ds = data;
		cssVariables = variables;

	} else {
		console.log('[stylus] Design system must be an object');
	}

} else {
	console.log('[stylus] Design system package is not specified');
}

module.exports = createPlugins({ds, cssVariables, theme, includeVars, includeThemes});
