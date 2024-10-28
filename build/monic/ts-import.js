/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

'use strict';

const
	config = require('@config/config'),
	path = require('upath');

const
	{config: pzlr, resolve} = require('@pzlr/build-core'),
	{commentModuleExpr: commentExpr} = include('build/const');

const
	deps = pzlr.dependencies.map((el) => RegExp.escape(el || el.src));

const importRgxp = new RegExp(
	`\\b(import${commentExpr}\\(?|export|from|require${commentExpr}\\()${commentExpr}(['"])(${deps.join('|')})(/.*?|(?=\\2))\\2`,
	'g'
);

/**
 * A Monic replacer to enable import/export/etc. constructions from one TS project to another TS project,
 * addressing the problems TS faces with these constructions
 *
 * @param {string} str
 * @param {string} filePath
 * @returns {string}
 */
module.exports = function tsImportReplacer(str, filePath) {
	if (!deps.length) {
		return str;
	}

	return str.replace(importRgxp, (str, statement, $1, root, src) => {
		if (resolve.depMap[root]) {
			const l = path.join(config.src.lib(), root, resolve.depMap[root].config.sourceDir, src);
			return `${statement} './${path.relative(path.dirname(filePath), l)}'`;
		}

		return str;
	});
};

Object.assign(module.exports, {
	importRgxp
});
