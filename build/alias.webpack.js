'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
	{src} = require('config');

/**
 * Parameters for webpack.alias
 */
module.exports = {
	assets: src.rel('assets'),
	fonts: src.rel('assets', 'fonts'),
	icons: src.rel('assets', 'icons'),
	images: src.rel('assets', 'images'),
	sprite: src.rel('assets', 'svg')
};
