/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

'use strict';

const
	json5 = require('json5'),
	responsiveLoader = require('responsive-loader'),
	path = require('node:path'),
	vm = require('node:vm');

const
	{isProd} = include('build/webpack/module/const');

/**
 * Webpack loader for converting and scaling images to different formats and sizes.
 * The loader is essentially a wrapper for `responsive-loader` that it's called for each format conversion.
 * It also adds support for the provided scaling of the original image size (1x, 2x, etc)
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
		originalImageFormat = undefined,
		options = {...this.getOptions(), ...parseResourceQuery(this.resourceQuery)};

	if (!isProd) {
		const
			loaderResponses = await collectLoaderResponses.call(this, imageBuffer, options, [originalImageFormat]),
			[[imageName]] = getImageNames(loaderResponses, options.outputPath);

		return `module.exports = {src: '${imageName}'}`;
	}

	const
		formats = [originalImageFormat, ...(options.formats ?? [])],
		loaderResponses = await collectLoaderResponses.call(this, imageBuffer, options, formats),
		imageNames = getImageNames(loaderResponses, options.outputPath),
		sources = getSources(imageNames);

	const
		[resolution, ext] = (options.defaultSrcPath ?? '').split('.'),
		source = sources.find(({type}) => type === ext),
		src = source?.srcset[resolution] ?? sources[0].srcset['2x'];

	const
		result = {src, sources};

	return `module.exports = ${JSON.stringify(result)}`;
};

/**
 * Parses the specified resourceQuery. Supports only json5 notation
 *
 * @param {string} query - '?{responsive:true,key1:value1,key2:value2}'
 * @returns {object}
 */
function parseResourceQuery(query) {
	try {
		const
			options = json5.parse(query.slice(1)),
			loaderResourceQuery = 'responsive';

		return Object.reject(options, loaderResourceQuery);

	} catch {
		return {};
	}
}

/**
 * Converts image names to an object with 'srcset' for each resolution
 *
 * @param {string[]} imageNames
 * @returns {object}
 */
function getSources(imageNames) {
	return imageNames.map((names) => {
		const
			srcset = {},
			type = path.extname(names[0]).replace('.', '');

		names.forEach((name, idx) => {
			srcset[`${idx + 1}x`] = name;
		});

		return {type, srcset};
	});
}

/**
 * Extracts only image names without the rest of the path
 *
 * @param {string[]} loaderResponses - original response returned by the responsiveLoader
 * @param {string} outputPath - output path for assets
 * @returns {string[]}
 */
function getImageNames(loaderResponses, outputPath) {
	return loaderResponses.map((code) => {
		const {images} = compileCodeToModule(code);
		return images.map(({path}) => path.replace(`${outputPath}/`, ''));
	});
}

/**
 * Compiles the code returned by the `responsive-loader` info a NodeJS module
 * The code is a string containing the code of a NodeJS module, and this function
 * converts this string into a real module returning the object that it exports
 *
 * @param {string} code
 * @returns {object}
 * @see https://github.com/dazuaz/responsive-loader/blob/master/src/index.ts#L178
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
 * @param {object} options
 * @param {string[]} formats
 * @returns {Promise<string[]>}
 */
function collectLoaderResponses(imageBuffer, options, formats) {
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
			format,
			...options
		})
	});

	return new Promise((resolve, reject) => {
		formats.forEach(
			(format) => responsiveLoader.call(createContext(resolve, reject, format), imageBuffer)
		);
	});
}
