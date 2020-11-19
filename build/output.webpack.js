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
	{hash, output} = include('build/build.webpack');

const
	concatUrl = require('urlconcat').concat;

let
	publicPath = webpack.publicPath();

if (publicPath) {
	publicPath = concatUrl(publicPath, '/').replace(/^[/]+/, '/');

} else {
	publicPath = '';
}

/**
 * Options for WebPack ".output"
 */
module.exports = {
	path: src.clientOutput(),
	publicPath,

	filename: hash(output, true),
	chunkFilename: `${hash(output, true)}.js`,

	hashFunction: webpack.hashFunction(),
	crossOriginLoading: 'anonymous'
};
