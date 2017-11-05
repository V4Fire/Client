'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
	path = require('path');

/**
 * Monic replacer for TS import declarations
 *
 * @param {string} lib - path to a node_modules folder
 * @returns {function(string, string): string}
 */
module.exports = function ({lib}) {
	return function (str, file) {
		return str.replace(/(['"])(@v4fire)(.*?)\1/, (str, $1, root, src) =>
			`'${path.relative(path.dirname(file), path.join(lib, root, 'src', src))}'`
		);
	};
};
