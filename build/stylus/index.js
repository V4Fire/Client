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
	pzlr = require('@pzlr/build-core');

const plugins = [
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

		/**
		 * Outputs the specified arguments to console
		 * @param args
		 */
		api.define('log', (...args) => console.log(...args));
	},

	color,
	string,
	url,
	object,
	blendModes
];

if (pzlr.config.designSystem) {
	plugins.push(include('build/stylus/ds'));
}

module.exports = plugins;
