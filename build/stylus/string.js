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

module.exports = function addPlugins(api) {
	/**
	 * Converts the specified string to dataURI
	 *
	 * @param {?} mime - mime type
	 * @param {?} str - source string
	 * @returns {string}
	 */
	api.define('dataURI', (mime, str) => `data:${mime.string};base64,${Buffer(str.string).toString('base64')}`);

	/**
	 * Link to the "string-dasherize" module
	 *
	 * @param {?} str - source string
	 * @returns {string}
	 */
	api.define('dasherize',
		(str) => require('string-dasherize')(str.string));

	/**
	 * Link to Sugar.String.camelize
	 *
	 * @param {?} str - source string
	 * @param {boolean} [upper]
	 * @returns {string}
	 */
	api.define('camelize', (str, upper) => {
		const res = camelize(str.string);
		return upper ? res[0].toUpperCase() + res.slice(1) : res;
	});

	/**
	 * Converts the specified string to lowercase
	 *
	 * @param {?} str
	 * @returns {string}
	 */
	api.define('toLowerCase',
		(str) => str.string.toLowerCase());

	/**
	 * Converts the specified string to uppercase
	 *
	 * @param {?} str
	 * @returns {string}
	 */
	api.define('toUpperCase',
		(str) => str.string.toUpperCase());

	/**
	 * Replaces a substring of the specified string by a regular expression to another string
	 *
	 * @param {string} str
	 * @param {string} replacer
	 * @param {string} replacement
	 * @param {string} [flags]
	 * @returns {string}
	 */
	api.define('replaceByRegExp',
		(
			{string: str},
			{string: replacer},
			{string: replacement},
			{string: flags} = {flags: undefined}
		) => str.replace(new RegExp(replacer, flags), replacement));

	/**
	 * Converts the specified plain svg text to dataURI
	 *
	 * @param {?} str - source string
	 * @returns {string}
	 */
	api.define('fromSVG', (str) => {
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
