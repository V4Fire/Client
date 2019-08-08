'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
	camelize = require('camelize'),
	SVGO = require('svgo-sync'),
	svgo = new SVGO();

module.exports = function (style) {
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
		(str) => require('string-dasherize')(str.string));

	/**
	 * Link to Sugar.String.camelize
	 *
	 * @param {?} str - source string
	 * @param {boolean} [upper]
	 * @returns {string}
	 */
	style.define('camelize', (str, upper) => {
		const res = camelize(str.string);
		return upper ? res[0].toUpperCase() + res.slice(1) : res;
	});

	/**
	 * Converts string to lowercase
	 * @param {string} src
	 */
	style.define('toLowerCase', (src) => {
		return src.toLowerCase();
	});

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
};
