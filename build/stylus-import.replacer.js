'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
	fs = require('fs'),
	path = require('path'),
	findUp = require('find-up'),
	cache = {};

/**
 * Monic replacer for Stylus @import declarations
 *
 * @param str - source string
 * @param file - file path
 * @returns {string}
 */
const fn = module.exports = function (str, file) {
	const
		cwd = path.dirname(file),
		parent = path.dirname(cwd),
		c = cache[parent] = cache[parent] || {};

	if (c[str]) {
		return c[str];
	}

	function r(str) {
		return str.replace(/\\/g, '/');
	}

	let blocks;
	return c[str] = str
		.replace(/@import "([^./~].*?\.styl)"/g, (str, url) => {
			const
				getUrl = (src) => r(path.relative(path.dirname(file), path.join(src, url)));

			let
				importUrl = getUrl(fn.blocks);

			if (!fs.existsSync(importUrl)) {
				importUrl = getUrl(blocks || (blocks = getUrl(findUp.sync('src', {cwd}))));
			}

			return `@import "${importUrl}"`;
		})

		.replace(/@import "~(.*?\.styl)"/g, (str, url) => {
			url = r(path.relative(path.dirname(file), path.join(fn.lib, url)));
			return `@import "${url}"`;
		});
};
