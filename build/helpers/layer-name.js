/**
 * The function determines the package in which the module is defined and
 * returns the name of this package from the `package.json` file
 *
 * @param {string} filePath
 * @returns {string}
 */
exports.getLayerName = function(filePath) {
	const
		pathToRootRgxp = /(?<path>.+)[/\\]src[/\\]/,
		pathToRootDir = filePath.match(pathToRootRgxp)?.groups?.path;

	const res = require(`${pathToRootDir}/package.json`).name;

	return res;
}