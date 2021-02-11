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
	color = include('build/stylus/color'),
	string = include('build/stylus/string'),
	url = include('build/stylus/url'),
	object = include('build/stylus/object'),
	blendModes = include('build/stylus/blend-modes'),
	ds = include('build/stylus/ds');

module.exports = [
	require('nib')(),

	function addPlugins(api) {
		/**
		 * Returns true if the specified file is already exists
		 *
		 * @param {?} path - file path
		 * @returns {boolean}
		 */
		api.define('file-exists', function fileExists(path) {
			return Boolean(stylus.utils.find(path.string, this.paths));
		});
	},

	ds,
	color,
	string,
	url,
	object,
	blendModes
];
