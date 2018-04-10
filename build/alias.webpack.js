'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
	path = require('path'),
	{src} = require('config');

/**
 * Parameters for webpack.alias
 */
module.exports = {
	sprite: path.join(src.assets(), 'svg')
};
