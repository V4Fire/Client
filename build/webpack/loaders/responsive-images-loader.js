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
	{urlLoaderOpts, isProd} = include('build/webpack/module/const');

const staticOptions = {
	outputPath: urlLoaderOpts.outputPath,
	name: isProd ? '[hash]-[width].[ext]' : '[name].[ext]',
	adapter: require('./adapters/scale-image-adapter'),
	sizes: [1, 2, 3],
	disable: !isProd
};

/**
 * Wepback loader for converting and scaling images to different formats and sizes.
 * The loader is essentially a wrapper for responsiveLoader that it's called for each format conversion.
 * It also adds support for scaling images to 1x and 2x resolutions of their original size.
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
	if (!isProd) {
		const
			loaderResponses = await collectLoaderResponses.call(this, imageBuffer, [undefined]),
			[[imageName]] = getImageNames(loaderResponses);

		return `module.exports = {src: '${imageName}'}`;
	}

	const
		formats = [undefined, 'webp', 'avif'],
		loaderResponses = await collectLoaderResponses.call(this, imageBuffer, formats),
		imageNames = getImageNames(loaderResponses),
		[, [source2xImageName]] = imageNames;

	const result = {
		src: source2xImageName,
		sources: getSources(imageNames)
	};

	return `module.exports = ${JSON.stringify(result)}`;
};

/**
 * Converts image names to an object with 'srcset' for each resolution
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
 * @param {string[]} loaderResponses - original response returned by the responsiveLoader
 * @returns {string[]}
 */
function getImageNames(loaderResponses) {
	return loaderResponses.map((code) => {
		const {images} = compileCodeToModule(code);
		return images.map(({path}) => path.replace(`${urlLoaderOpts.outputPath}/`, ''));
	});
}

/**
 * Compiles the code returned by the responsiveLoader to the NodeJS module
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
 * @param {string[]} formats
 * @returns {Promise<string[]>}
 */
function collectLoaderResponses(imageBuffer, formats) {
	let
		convertationTime = 0;

	const
		loaderResponses = [];

	const createContext = (resolve, reject, format) => ({
		...this,

		async: () => (err, data) => {
			if (err != null) {
				reject('Failed to process the image', err);
				return;
			}

			loaderResponses.push(data);

			if (++convertationTime >= formats.length) {
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
		formats.forEach(
			(format) => responsiveLoader.call(createContext(resolve, reject, format), imageBuffer)
		);
	});
}
