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
 * Options for `webpack.devtool`
 */
module.exports = config.webpack.devtool() ?? false;
