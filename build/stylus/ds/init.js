'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
	$C = require('collection.js'),
	{getThemes} = include('build/ds'),
	{DS} = include('build/stylus/ds/const'),
	{prepareData} = include('build/stylus/ds/helpers');

/**
 * Convert raw design system data to the project design system
 *
 * @param {DesignSystem} raw
 * @param {boolean|string[]} [includeThemes]
 * @param {string} [theme]
 * @returns {DesignSystem}
 */
module.exports = function createDesignSystem(raw, theme, includeThemes) {
	const
		ds = prepareData($C.clone(raw));

	const
		themesList = getThemes(raw, includeThemes),
		isThemesIncluded = themesList != null && themesList.length > 0;

	if (isThemesIncluded && !theme) {
		throw new Error('[stylus] Design system have themes, but theme doesn\'t specified');
	}

	Object.assign(DS, ds);

	return DS;
};
