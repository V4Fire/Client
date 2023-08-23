/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

'use strict';

const
	config = require('@config/config');

/**
 * Options for `webpack.devtool`
 */
module.exports = config.webpack.devtool() ?? false;
