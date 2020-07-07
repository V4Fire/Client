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
 * Monic replacer to enable the import/export/etc. constructions from one TS project to another TS project,
 * because TS have problems with it
 *
 * @param {string} str
 * @param {string} filePath
 * @returns {string}
 */
module.exports = function tsImportReplacer(str, filePath) {
	if (!deps.length) {
		return str;
	}

	return str.replace(importRgxp, (str, statement, $1, root, url) => {
		if (resolve.depMap[root]) {
			const l = path.join(config.src.lib(), root, resolve.depMap[root].config.sourceDir, url);
			return `${statement} './${path.relative(path.dirname(filePath), l)}'`;
		}

		return str;
	});
};

Object.assign(module.exports, {
	importRgxp
});
