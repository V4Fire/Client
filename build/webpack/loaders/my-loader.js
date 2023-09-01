const
	responsiveLoader = require('responsive-loader');
	fs = require('fs');

const
	{urlLoaderOpts} = include('build/webpack/module/const');

// Post process images
module.exports = async function myLoader(buffer) {
	console.log(buffer);

	return 'module.exports = {}';
};
