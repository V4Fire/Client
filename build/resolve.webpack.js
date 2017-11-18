'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * Returns a list for webpack.resolve
 *
 * @param {Array<string>} modules - list of modules
 * @returns {Array<string>}
 */
module.exports = function ({modules}) {
	return {
		extensions: ['.ts', '.js', '.json'],
		modules
	};
};
