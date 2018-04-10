'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
	importRgxp = /requireMonic\((.*?)\)/g;

/**
 * Monic replacer for HTML import declarations
 *
 * @param {string} str
 * @returns {string}
 */
module.exports = function (str) {
	return str.replace(importRgxp, (str, url) => `\n//#include ${url}\n`);
};
