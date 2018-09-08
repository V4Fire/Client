'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
	stylus = require('stylus'),
	string = include('build/stylus/string'),
	color = include('build/stylus/color');

module.exports = [
	require('nib')(),

	function (style) {
		/**
		 * Returns true if the specified file is already exists
		 *
		 * @param {?} path - file path
		 * @returns {boolean}
		 */
		style.define('file-exists', function (path) {
			return Boolean(stylus.utils.find(path.string, this.paths));
		});
	},

	string,
	color
];
