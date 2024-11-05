/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

'use strict';

const {config} = require('@pzlr/build-core')

/**
 * The function determines the package in which the module is defined and
 * returns the name of this package from the `package.json` file
 *
 * @param {string} filePath
 * @returns {string}
 */
function getLayerName(filePath) {
	const
		pathToRootRgxp = new RegExp(`(?<path>.+)[/\\\\]${config.sourceDir}[/\\\\]`),
		pathToRootDir = filePath.match(pathToRootRgxp)?.groups?.path;

	const res = require(`${pathToRootDir}/package.json`).name;

	return res;
}

exports.getLayerName = getLayerName;
