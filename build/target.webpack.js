'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
	config = require('config');

/**
 * Options for WebPack ".target"
 */
module.exports = config.webpack.target() ?? false;
