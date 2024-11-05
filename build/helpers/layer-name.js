/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

'use strict';

const {
	config,
	resolve: {rootDependencies}
} = require('@pzlr/build-core');

const
	isPathInside = require('is-path-inside'),
	fs = require('fs'),
	path = require('path');

/**
 * The function determines the package in which the module is defined and
 * returns the name of this package from the `package.json` file
 *
 * @param {string} filePath
 * @returns {string}
 */
function getLayerName(filePath) {
	let layer = config.projectName;

	for (let i = 0; i < rootDependencies.length; i++) {
		if (isPathInside(fs.realpathSync(filePath), fs.realpathSync(rootDependencies[i]))) {
			const pathPackageJson = path.resolve(fs.realpathSync(rootDependencies[i]), '..', 'package.json');
			layer = require(pathPackageJson).name;
			break;
		}
	}

	return layer;
}

exports.getLayerName = getLayerName;
