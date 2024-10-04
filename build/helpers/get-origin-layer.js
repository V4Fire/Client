const {getLayerName} = require('./layer-name');

exports.getOriginLayerFromPath = function(filePath) {
	const
		pathToOriginPackage = filePath.match(/(?<path>.+)[/\\]node_modules[/\\]/)?.groups?.path;

	if (pathToRootPackage == null) {
		return getLayerName(filePath);
	}

	return require(`${pathToOriginPackage}/package.json`).name;
}