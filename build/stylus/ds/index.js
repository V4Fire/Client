/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

'use strict';

/**
 * [[include:build/stylus/ds/README.md]]
 * @packageDocumentation
 */

const
	config = require('@config/config');

const
	{createDesignSystem} = include('build/stylus/ds/helpers'),
	getPlugins = include('build/stylus/ds/plugins'),
	{getDS} = include('build/ds');

const
	theme = config.theme.default(),
	includeThemes = config.theme.include(),
	themeAttribute = config.theme.attribute,
	{'ds/use-css-vars': useCSSVarsInRuntime} = config.runtime();

let
	ds = {},
	cssVariables = {};

const
	designSystem = getDS();

if (Object.isDictionary(designSystem)) {
	const
		{data, variables} = createDesignSystem(designSystem);

	ds = data;
	cssVariables = variables;

} else {
	throw new TypeError('[stylus] Design system must be an object');
}

module.exports = getPlugins({
	ds,
	cssVariables,
	theme,
	includeThemes,
	themeAttribute,
	useCSSVarsInRuntime
});
