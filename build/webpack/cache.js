'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
	{webpack} = require('@config/config'),
	{cacheDir} = include('build/helpers');

/**
 * Returns parameters for `webpack.cache`
 *
 * @param {(number|string)} buildId
 * @returns {(object|boolean)}
 */
module.exports = function cache({buildId}) {
	switch (webpack.cacheType()) {
		case 'mem':
		case 'memory':
			return {type: 'memory'};

		case 'fs':
		case 'filesystem':
			return {
				name: String(buildId),
				type: 'filesystem',
				cacheDirectory: cacheDir
			};

		default:
			return false;
	}
};
