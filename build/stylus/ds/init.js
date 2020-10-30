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
	{prepareData} = include('build/stylus/ds/helpers');

/**
 * Converts raw design system data to the project design system
 *
 * @param {DesignSystem} raw
 * @returns {DesignSystem}
 */
module.exports = function createDesignSystem(raw) {
	const
		ds = $C.clone(raw);

	prepareData(ds);
	return ds;
};
