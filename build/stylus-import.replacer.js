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
	cache = {};

module.exports = function (blocks) {
	return (str, file) => {
		if (cache[str]) {
			return cache[str];
		}

		return cache[str] = str.replace(/@import "([^./].*?\.styl)"/g, (str, url) => {
			url = path.relative(path.dirname(file), path.join(blocks, url)).replace(/\\/g, '/');
			return `@import "${url}"`;
		});
	};
};
