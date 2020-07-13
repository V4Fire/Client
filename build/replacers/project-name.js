'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
	{resolve} = require('@pzlr/build-core');

const
	projectNameRgxp = /@projectName\b/g;

/**
 * Monic replacer that adds the "@projectName" declaration which indicates for which layer belong one or another file
 *
 * @param {string} str
 * @param {string} filePath
 * @returns {string}
 *
 * @example
 * **node_modules/foo/bla.js**
 *
 * ```js
 * // Will be replaced to `"foo"`
 * @projectName
 * ```
 *
 * **baz/bla.js**
 *
 * ```js
 * // Will be replaced to `"baz"`
 * @projectName
 * ```
 */
module.exports = function projectNameReplacer(str, filePath) {
	return str.replace(projectNameRgxp, () => {
		const
			layer = resolve.getLayerByPath(filePath);

		if (!layer) {
			throw new Error(`Can't find a layer for the file "${filePath}"`);
		}

		return `"${layer.src}"`;
	});
};

Object.assign(module.exports, {
	projectNameRgxp
});
