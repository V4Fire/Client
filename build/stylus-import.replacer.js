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
	{src} = require('config'),
	{resolve} = require('@pzlr/build-core');

const
	cache = Object.create(null);

/**
 * Monic replacer for Stylus @import declarations
 *
 * @param {string} str
 * @param {string} file
 * @returns {Promise<string>}
 */
module.exports = async (str, file) => {
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

	const
		importBlock = /@import "([^./~].*?\.styl)"/g;

	let
		importStatement,
		newStr = str;

	while ((importStatement = importBlock.exec(str))) {
		const
			url = importStatement[1],
			file = await resolve.block(url);

		if (file) {
			newStr = newStr.replace(importStatement[0], `@import "./${r(path.relative(cwd, file))}"`);
		}
	}

	c[str] = newStr.replace(/@import "~(.*?\.styl)"/g, (str, url) => {
		url = r(path.relative(cwd, path.join(src.lib(), url)));
		return `@import "${url}"`;
	});
};
