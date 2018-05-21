'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
	path = require('upath');

module.exports = {
	moduleExtensions: ['-loader'],
	alias: {
		proxy: path.join(__dirname, '../build/loaders/proxy')
	}
};
