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
	{hash} = include('build/helpers.webpack');

module.exports = function ({output}) {
	return {
		path: config.src.cwd,
		publicPath: '/',
		filename: hash(output, true)
	};
};
