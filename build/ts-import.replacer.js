'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
	path = require('path'),
	{src} = require('config');

/**
 * Monic replacer for TS import declarations
 *
 * @param {string} str
 * @param {string} file
 * @returns {string}
 */
module.exports = function (str, file) {
	return str.replace(/(['"])(@v4fire)(.*?)\1/, (str, $1, root, url) =>
		`'${path.relative(path.dirname(file), path.join(src.lib(), root, 'src', url))}'`
	);
};
