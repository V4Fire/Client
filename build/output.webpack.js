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

/**
 * Parameters for webpack.output
 */
module.exports = {
	path: src.cwd(),
	publicPath: webpack.publicPath(),
	filename: hash(output, true)
};
