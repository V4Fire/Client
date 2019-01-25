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
	concatUrl = require('urlconcat').concat,
	publicPath = webpack.publicPath();

/**
 * Parameters for webpack.output
 */
module.exports = {
	path: src.clientOutput(),
	publicPath: publicPath ? concatUrl(publicPath, '/') : '',
	filename: hash(output, true),
	hashFunction: webpack.hashFunction()
};
