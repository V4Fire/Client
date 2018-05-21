'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
	path = require('upath'),
	HardSourceWebpackPlugin = require('hard-source-webpack-plugin');

const
	{buildCache} = include('build/build.webpack');

/**
 * Returns an empty WebPack config
 *
 * @param {(number|string)} buildId - build id
 * @returns {Object}
 */
module.exports = function ({buildId}) {
	return {
		mode: 'development',
		cache: true,
		devtool: false,

		entry: {
			__tmp: path.join(__dirname, 'fake.webpack.txt')
		},

		output: {
			filename: '[name]'
		},

		optimization: {
			minimize: false
		},

		plugins: [
			new HardSourceWebpackPlugin({
				cacheDirectory: path.join(buildCache, `${buildId}/[confighash]`)
			})
		]
	};
};
