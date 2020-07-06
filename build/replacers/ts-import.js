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
	importRgxp = new RegExp(`\\b(import\\s*\\(?|export|from|require\\s*\\()\\s*(['"])(${deps.join('|')})(/.*?|(?=\\2))\\2`, 'g');

/**
 * Monic replacer for TS import/export declarations
 *
 * @param {string} str
 * @param {string} file
 * @returns {string}
 */
module.exports = function (str, file) {
	if (!deps.length) {
		return str;
	}

	return str.replace(importRgxp, (str, statement, $1, root, url) => {
		if (resolve.depMap[root]) {
			const l = path.join(config.src.lib(), root, resolve.depMap[root].config.sourceDir, url);
			return `${statement} './${path.relative(path.dirname(file), l)}'`;
		}

		return str;
	});
};
