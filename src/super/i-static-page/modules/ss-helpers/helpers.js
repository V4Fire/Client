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
	return Boolean(webpack.fatHTML() || webpack.inlineInitial() || forceInline);
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
		staticExpr = `concatURLs(${toExpr(webpack.publicPath())}, ${toExpr(path)})`,
		concatURLs = "function concatURLs(a, b) { return a ? a.replace(/[\\\\/]+$/, '') + '/' + b.replace(/^[\\\\/]+/, '') : b; }";

	if (webpack.dynamicPublicPath()) {
		const
			id = 'PUBLIC_PATH',
			expr = `(typeof ${id} === 'string' ? concatURLs(${id}, ${toExpr(path)}) : ${staticExpr})`;

		return [`((function () { ${concatURLs} return ${expr}; })())`];
	}

	if (Object.isArray(path)) {
		return [`((function () { ${concatURLs} return ${staticExpr}; })())`];
	}

	return webpack.publicPath(path);

	function toExpr(expr) {
		const
			res = String(expr);

		if (expr == null) {
			return res;
		}

		if (Object.isString(expr) || expr.interpolate === false) {
			return `'${res.replace(/'/g, '\\\'')}'`;
		}

		return res;
	}
}
