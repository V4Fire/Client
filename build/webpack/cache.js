'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
	path = require('path'),
	{webpack, src} = require('@config/config');

/**
 * Returns options for `webpack.cache`
 *
 * @param {(string)} name - name of build
 * @returns {(!Object|boolean)}
 */
module.exports = function cache({name}) {
	switch (webpack.cacheType()) {
		case 'mem':
		case 'memory':
			return {type: 'memory'};

		case 'fs':
		case 'filesystem':
			if (name === 'html') {
				return false;
			}

			return {
				name,
				type: 'filesystem',
				compression: false,
				cacheDirectory: path.join(src.cwd(), 'app-cache', 'webpack')
			};

		default:
			return false;
	}
};
