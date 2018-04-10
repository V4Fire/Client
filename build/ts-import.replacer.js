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
	{src} = require('config'),
	{config: {dependencies}} = require('@pzlr/build-core'),
	{normalizeSep} = include('build/helpers');

const
	deps = dependencies.map((el) => RegExp.escape(el || el.src)),
	importRgxp = new RegExp(`('|")(${deps.join('|')})(.*?)\\1`, 'g');

/**
 * Monic replacer for TS import declarations
 *
 * @param {string} str
 * @param {string} file
 * @returns {string}
 */
module.exports = function (str, file) {
	if (!deps.length) {
		return str;
	}

	return str.replace(importRgxp, (str, $1, root, url) =>
		`'${normalizeSep(path.relative(path.dirname(file), path.join(src.lib(), root, 'src', url)))}'`
	);
};
