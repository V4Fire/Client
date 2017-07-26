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

	let
		blocks,
		localBlocks;

	return c[str] = str
		.replace(/@import "([^./~].*?\.styl)"/g, (str, url) => {
			const urls = [
				fn.blocks,
				localBlocks || (localBlocks = findUp.sync('src/blocks', {cwd})),
				blocks || (blocks = findUp.sync('src', {cwd})),
				fn.coreClient
			];

			for (let i = 0; i < urls.length; i++) {
				const
					fullPath = path.join(urls[i], url);

				if (fs.existsSync(fullPath)) {
					return `@import "./${r(path.relative(cwd, fullPath))}"`;
				}
			}

			return `@import "${url}"`;
		})

		.replace(/@import "~(.*?\.styl)"/g, (str, url) => {
			url = r(path.relative(cwd, path.join(fn.lib, url)));
			return `@import "${url}"`;
		});
};
