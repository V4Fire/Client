'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
	{webpack} = require('config'),
	{cacheDir} = include('build/helpers.webpack');

/**
 * Returns options for Webpack ".cache"
 *
 * @param {(number|string)} buildId - build id
 * @returns {(!Object|boolean)}
 */
module.exports = function cache({buildId}) {
	switch (webpack.cacheType()) {
		case 'memory':
			return {type: 'memory'};

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
