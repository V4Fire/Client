'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
	config = require('config'),
	{hash} = include('build/build.webpack');

/**
 * Returns an object for webpack.output
 *
 * @param {string} output - output path
 * @returns {{path: string, publicPath: string, filename: string}}
 */
module.exports = function ({output}) {
	return {
		path: config.src.cwd(),
		publicPath: '/',
		filename: hash(output, true)
	};
};
