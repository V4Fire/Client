/**
 * The function determines the package in which the module is defined and
 * returns the name of this package from the `package.json` file
 *
 * @param {string} filePath
 * @returns {string}
 */
exports.getLayerName = function(filePath) {

	if (filePath == null) {
		console.trace('filepath is null');
	}


	const
		pathToRootRgxp = /(?<path>.+)[/\\]src[/\\]/,
		pathToRootDir = filePath.match(pathToRootRgxp)?.groups?.path;

	const res = require(`${pathToRootDir}/package.json`).name;

	// console.log('getLayerName', {res, pathToRootDir, file});

	return res;
}