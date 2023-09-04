/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

'use strict';

const
	responsiveLoader = require('responsive-loader'),
	path = require('path'),
	vm = require('vm');

const
	{urlLoaderOpts} = include('build/webpack/module/const');

const staticOptions = {
	outputPath: urlLoaderOpts.outputPath,
	name: '[hash]-[width].[ext]',
	adapter: require('./adapters/scale-image-adapter'),
	sizes: [1, 2, 3]
};

/**
 * Wepback loader for converting and scaling images to different formats and sizes
 * The loader is basically a wrapper for responsiveLoader that it calls for each format convertation
 * It also adds support for scaling images by 1x and 2x resolution of its original size
 *
 * @param {string} imageBuffer - contents of the image
 * @returns {string}
 *
 * @example
 * ```javascript
 * const image = require('path/to/image.png?responsive');
 *
 * {
 *   // 4e3edf6d108c0701 - hash
 *   // 346 - 2x size of the original image
 *   // png - format of the original image
 *   src: '4e3edf6d108c0701-346.png',
 *   sources: [
 *     {
 *       type: 'png',
 *       srcset: {
 *         '1x': 'f6506a0261a44c16-173.png'
 *         '2x': '4e3edf6d108c0701-346.png'
 *         '3x': '19b08609ec6e1165-521.png'
 *       }
 *     },
 *     {
 *       type: 'webp',
 *       srcset: {
 *         '1x': '4e62cb10bc2b3029-173.webp'
 *         '2x': 'f49d341fedd8bdc5-346.webp'
 *         '3x': '4ca48b9469e44566-521.webp'
 *       }
 *     },
 *     {
 *       type: 'avif',
 *       srcset: {
 *         '1x': '71842fd826667798-173.avif'
 *         '2x': '8da0057becea6b31-346.avif'
 *         '3x': 'b6d75fb5bdf3121b-521.avif'
 *       }
 *     }
 *   ]
 * }
 * ```
 */
module.exports = async function responsiveImagesLoader(imageBuffer) {
	const
		loaderResponses = await collectLoaderResponses.call(this, imageBuffer),
		imageNames = getImageNames(loaderResponses),
		[, source2xImageName] = imageNames[0];

	const result = {
		src: source2xImageName,
		sources: getSources(imageNames)
	};

	return `module.exports = ${JSON.stringify(result)}`;
};

/**
 * Converts image names to object with srcset for each resolution
 *
 * @param {string[]} imageNames
 * @returns {object}
 */
function getSources(imageNames) {
	return imageNames.map((names) => {
		const
			[x1, x2, x3] = names,
			type = path.extname(x1).replace('.', '');

		return {
			type,
			srcset: {'1x': x1, '2x': x2, '3x': x3}
		};
	});
}

/**
 * Extracts only image names without the rest of the path
 *
 * @param {string[]} loaderResponses - original response returns by responsiveLoader
 * @returns {string[]}
 */
function getImageNames(loaderResponses) {
	return loaderResponses.map((code) => {
		const {images} = compileCodeToModule(code);
		return images.map(({path}) => path.replace(`${urlLoaderOpts.outputPath}/`, ''));
	});
}

/**
 * Compiles the code returned by responsiveLoader to the NodeJS module
 *
 * @param {string} code
 * @returns {module}
 */
function compileCodeToModule(code) {
	const context = vm.createContext({
		// eslint-disable-next-line camelcase
		__webpack_public_path__: '',
		module
	});

	vm.runInContext(code, context);

	return context.module.exports;
}

/**
 * Calls the responsiveLoader multiple times for each image format and collects responses
 *
 * @param {string} imageBuffer
 * @returns {string[]}
 */
function collectLoaderResponses(imageBuffer) {
	let
		convertationTime = 0;

	const
		// Undefined for source format
		formatsToConvert = [undefined, 'webp', 'avif'],
		loaderResponses = [];

	const createContext = (resolve, reject, format) => ({
		...this,

		// Overriding this function so that we can call the responsiveLoader multiple times without
		// going to the next loader
		async: () => (err, data) => {
			if (err != null) {
				reject('Failed to process the image', err);
				return;
			}

			loaderResponses.push(data);

			if (++convertationTime >= formatsToConvert.length) {
				resolve(loaderResponses);
			}
		},

		getOptions: () => ({
			...staticOptions,
			format,
			...this.getOptions()
		})
	});

	return new Promise((resolve, reject) => {
		formatsToConvert.forEach(
			(format) => responsiveLoader.call(createContext(resolve, reject, format), imageBuffer)
		);
	});
}
