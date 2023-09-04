const
	fs = require('fs'),
	path = require('path');

const
	{urlLoaderOpts} = include('build/webpack/module/const');

module.exports = function myLoader(buffer) {
	const
		regexp = new RegExp(`path: __webpack_public_path__ \\+ "${urlLoaderOpts.outputPath}/(.+?)"`, 'g'),
		results = [...buffer.matchAll(regexp)];

	results.forEach(([, originPath], idx) => {
		const
			webpPath = getOutputPath(originPath),
			scaledWebpPath = getOutputPath(getScaledPath(originPath, idx + 1)),
			pngPath = toPng(webpPath),
			scaledPngPath = toPng(scaledWebpPath);

		console.log({webpPath, scaledWebpPath, pngPath, scaledPngPath})

		// TODO: replace assets in dist
	});

	const
		assetRegexp = new RegExp(`path: __webpack_public_path__ \\+ "${urlLoaderOpts.outputPath}.*(?<=/)(.+?)-\\d+\\.webp"`),
		asset = assetRegexp.exec(buffer)?.[1];

	if (asset == null) {
		throw new Error('Cannot match asset name');
	}

	return `module.exports = {
		src: '${asset}@2x.png',
		sources: [
			{type: 'webp', srcset: {'1x': '${asset}@1x.webp', '2x': '${asset}@2x.webp', '3x': '${asset}@3x.webp'}},
			{type: 'png', srcset: {'1x': '${asset}@1x.png', '2x': '${asset}@2x.png', '3x': '${asset}@3x.png'}}
		]
	}`;
};

function getOutputPath(asset) {
	const assetPath = path.posix.join(urlLoaderOpts.outputPath, asset);
	return path.resolve('dist', 'client', assetPath);
}

function getScaledPath(path, times) {
	return path.replace(/-\d+/, `@${times}x`);
}

function toPng(path) {
	return path.replace('.webp', '.png');
}
