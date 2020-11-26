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

const
	concatUrl = require('urlconcat').concat;

/**
 * Returns options for Webpack ".output"*
 * @returns {!Object}
 */
module.exports = function output() {
	let
		publicPath = webpack.publicPath();

	if (publicPath) {
		publicPath = concatUrl(publicPath, '/').replace(/^[/]+/, '/');

	} else {
		publicPath = '';
	}

	return {
		path: src.clientOutput(),
		publicPath,

		filename: `${hash(outputPattern, true)}.js`,
		chunkFilename: `${hash(outputPattern, true)}.js`,

		chunkLoading: 'jsonp',
		chunkFormat: 'array-push',

		hashFunction: webpack.hashFunction(),
		crossOriginLoading: 'anonymous'
	};
};
