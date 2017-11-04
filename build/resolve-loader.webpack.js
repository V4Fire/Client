'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
	path = require('path');

module.exports = {
	moduleExtensions: ['-loader'],
	alias: {
		prop: path.join(__dirname, '../build/loaders/prop'),
		proxy: path.join(__dirname, '../build/loaders/proxy')
	}
};
