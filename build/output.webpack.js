'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
	{src, webpack} = require('config'),
	{hash, output: outputPattern} = include('build/helpers.webpack');

/**
 * Returns options for Webpack ".output"
 * @returns {!Object}
 */
module.exports = function output() {
	return {
		path: src.clientOutput(),
		publicPath: webpack.publicPath(),

		filename: `${hash(outputPattern, true)}.js`,
		chunkFilename: `${hash(outputPattern, true)}.js`,

		chunkLoading: 'jsonp',
		chunkFormat: 'array-push',

		hashFunction: webpack.hashFunction(),
		crossOriginLoading: 'anonymous'
	};
};
