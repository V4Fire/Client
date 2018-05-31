'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
	config = require('config'),
	path = require('upath');

const {
	config: pzlr,
	resolve
} = require('@pzlr/build-core');

const
	deps = pzlr.dependencies.map((el) => RegExp.escape(el || el.src)),
	importRgxp = new RegExp(`(['"])(${deps.join('|')})(/.*?|(?=\\1))\\1`, 'g');

/**
 * Monic replacer for TS import declarations
 *
 * @param {string} str
 * @param {string} file
 * @returns {string}
 */
module.exports = function (str, file) {
	if (!deps.length) {
		return str;
	}

	return str.replace(importRgxp, (str, $1, root, url) => {
		if (resolve.depMap[root]) {
			const l = path.join(config.src.lib(), root, resolve.depMap[root].config.sourceDir, url);
			return `'./${path.relative(path.dirname(file), l)}'`;
		}

		return str;
	});
};
