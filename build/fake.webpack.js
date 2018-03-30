'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

module.exports = {
	mode: 'development',
	cache: true,
	devtool: false,

	entry: {
		__tmp: __filename
	},

	output: {
		filename: '[name]'
	},

	optimization: {
		minimize: false
	}
};
