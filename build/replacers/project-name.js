'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
	{resolve} = require('@pzlr/build-core'),
	projRgxp = /@projectName\b/g;

/**
 * Monic replacer for inserting file project name
 *
 * @param {string} str
 * @param {string} url
 * @returns {string}
 */
module.exports = function (str, url) {
	return str.replace(projRgxp, () => {
		const
			layer = resolve.getLayerByPath(url);

		if (!layer) {
			throw new Error(`Cannot find a layer for the file: ${url}`);
		}

		return `"${layer.src}"`;
	});
};
