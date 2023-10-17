/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
	fs = require('fs');

const
	{webpack, src, csp} = require('@config/config'),
	getHash = include('build/hash');

exports.canLoadStylesDeferred = !webpack.externalizeInline() && !csp.nonce();

exports.needInline = needInline;

/**
 * Returns true if should include the code inline in the tag
 *
 * @param {boolean} [forceInline]
 * @returns {boolean}
 */
function needInline(forceInline) {
	return Boolean(forceInline || webpack.fatHTML() || webpack.inlineInitial());
}

exports.addPublicPath = addPublicPath;

/**
 * Attaches the `publicPath` property to the specified path
 *
 * @param {(string|Array<string>)} path
 * @returns {(string|Array<String>)}
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

exports.emitFile = emitFile;

/**
 * Information about output file paths
 *
 *  1. outputPath - absolute path to the file
 *  2. loadPath - path to load the file, taking into account the configured public path
 *
 * @typedef {{
 *   outputPath: string,
 *   loadPath: string
 * }} PathData
 */

/**
 * Creates a new file with the given content and stores it in the output directory
 *
 * @param {string} content - file content
 * @param {string} fileName - file name
 *
 * @returns {PathData}
 */
function emitFile(content, fileName) {
	fileName = webpack.output({name: fileName, hash: getHash(content)});

	const
		outputPath = src.clientOutput(fileName),
		loadPath = webpack.publicPath(fileName);

	fs.writeFileSync(outputPath, content);

	return {outputPath, loadPath};
}
