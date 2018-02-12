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
	SVGO = require('svgo-sync'),
	svgo = new SVGO();

module.exports = [
	require('nib')(),

	function (style) {
		/**
		 * Converts string to dataURI
		 *
		 * @param {?} mime - mime type
		 * @param {?} str - source string
		 * @returns {string}
		 */
		style.define('dataURI', (mime, str) =>
			`data:${mime.string};base64,${Buffer(str.string).toString('base64')}`);

		/**
		 * Link to Sugar.String.dasherize
		 *
		 * @param {?} str - source string
		 * @returns {string}
		 */
		style.define('dasherize',
			(str) => str.string.dasherize());

		/**
		 * Link to Sugar.String.camelize
		 *
		 * @param {?} str - source string
		 * @returns {string}
		 */
		style.define('camelize',
			(str, upper) => str.string.camelize(upper));

		/**
		 * Converts plain svg text to dataURI
		 *
		 * @param {?} str - source string
		 * @returns {string}
		 */
		style.define('fromSVG', (str) => {
			let svg = str.string.replace(
				'<svg ',
				'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" '
			);

			if (isProd) {
				svg = svgo.optimizeSync(svg).data;
			}

			const base64 = Buffer([
				'<?xml version="1.0" encoding="utf-8"?>',
				'<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">',
				svg
			].join('')).toString('base64');

			return `data:image/svg+xml;base64,${base64}`;
		});

		/**
		 * Returns true if the specified file is already exists
		 *
		 * @param {?} path - file path
		 * @returns {boolean}
		 */
		style.define('file-exists', function (path) {
			return Boolean(stylus.utils.find(path.string, this.paths));
		});
	}
];
