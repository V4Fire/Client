const {getLayerName} = require('./layer-name');

/**
 * The function returns a layer name of the root package.
 *
 * @param {string} filePath
 * @returns {string}
 */
exports.getOriginLayerFromPath = function(filePath) {
	const
		pathToOriginPackage = filePath.match(/(?<path>.+)[/\\]node_modules[/\\]/)?.groups?.path;

	if (pathToOriginPackage == null) {
		return getLayerName(filePath);
	}

	return require(`${pathToOriginPackage}/package.json`).name;
}