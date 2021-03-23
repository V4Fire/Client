'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:build/stylus/ds/README.md]]
 * @packageDocumentation
 */

const
	pzlr = require('@pzlr/build-core'),
	config = require('config');

const
	{createDesignSystem} = include('build/stylus/ds/helpers'),
	getPlugins = include('build/stylus/ds/plugins'),
	{getDS} = include('build/ds');

const
	theme = config.theme.default(),
	includeThemes = config.theme.include(),
	{'ds/use-css-vars': useCSSVarsInRuntime} = config.runtime();

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
		console.warn('[stylus] Design system must be an object');
	}

} else {
	console.warn('[stylus] Design system package is not specified');
}

module.exports = getPlugins({ds, cssVariables, theme, useCSSVarsInRuntime, includeThemes});
