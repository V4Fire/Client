/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
	{webpack} = require('config');

exports.needInline = needInline;

/**
 * Returns true if should inline a resource
 *
 * @param {boolean=} [forceInline]
 * @returns {boolean}
 */
function needInline(forceInline) {
	return Boolean(webpack.fatHTML() || forceInline);
}

exports.addPublicPath = addPublicPath;

/**
 * Attaches `publicPath` to the specified path
 *
 * @param {(string|!Array<string>)} path
 * @returns {(string|!Array<String>)}
 */
function addPublicPath(path) {
	const
		staticExpr = `concatURLs(${toExpr(webpack.publicPath())}, ${toExpr(path)})`;

	if (webpack.dynamicPublicPath()) {
		const
			id = 'PUBLIC_PATH',
			expr = `(typeof ${id} === 'string' ? concatURLs(${id}, ${toExpr(path)}) : ${staticExpr})`;

		return [`((function () { ${concatURLs.toString()} return ${expr}; })())`];
	}

	if (Object.isArray(path)) {
		return [`((function () { ${concatURLs.toString()} return ${staticExpr}; })())`];
	}

	return webpack.publicPath(path);

	/* eslint-disable prefer-template */

	function concatURLs(a, b) {
		return a.replace(/\/$/, '') + '/' + b.replace(/^\//, '');
	}

	/* eslint-enable prefer-template */

	function toExpr(expr) {
		return Object.isArray(expr) ? expr[0] : `'${expr.replace(/'/g, '\\\'')}'`;
	}
}
