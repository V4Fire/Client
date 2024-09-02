/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

'use strict';

const
	{webpack} = require('@config/config');

/**
 * Returns parameters for `webpack.cache`
 *
 * @param {(number|string)} buildId
 * @returns {(object|boolean)}
 * @throws {Error}
 */
module.exports = function cache() {
	switch (webpack.cacheType()) {
		case 'mem':
		case 'memory':
			return true;

		case 'fs':
		case 'filesystem':
			throw new Error('Filesystem cache not supported in rspack');

		default:
			return false;
	}
};
