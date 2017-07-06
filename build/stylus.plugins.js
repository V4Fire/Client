'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
	Sugar = require('sugar'),
	stylus = require('stylus');

module.exports = [
	require('nib')(),

	/**
	 * fromSVG
	 */
	function (style) {
		style.define('dataURI', (mime, str) =>
			`data:${mime.string};base64,${Buffer(str.string).toString('base64')}`);

		style.define('dasherize',
			(str) => Sugar.String.dasherize(str.string));

		style.define('camelize',
			(str, upper) => Sugar.String.camelize(str.string, upper));

		style.define('fromSVG', (str) =>
			`data:image/svg+xml;base64,${Buffer([
				'<?xml version="1.0" encoding="utf-8"?>',
				'<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">',
				str.string.replace(
					'<svg ',
					'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" '
				)
			].join('')).toString('base64')}`
		);

		style.define('file-exists', function (path) {
			return Boolean(stylus.utils.find(path.string, this.paths));
		});
	}
];
