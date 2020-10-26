'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
	$C = require('collection.js'),
	stylus = require('stylus'),
	config = require('config'),
	{cssVariables} = include('build/stylus/ds/const');

const
	themedFields = config.themedFields(),
	{theme} = config.runtime();

	Object.defineProperty(cssVariables, '__map__', {
	enumerable: false,
	value: {}
});

/**
 * Sets a variable into cssVariables dictionary by the specified path
 *
 * @param {string} path
 * @param {unknown} dsValue
 * @param {string} [theme]
 */
function saveVariable(path, dsValue, theme) {
	const
		variable = `--${path.split('.').join('-')}`;

	const
		mapValue = [variable, dsValue];

	$C(cssVariables).set(`var(${variable})`, path);

	if (theme === undefined) {
		cssVariables.__map__[path] = mapValue;

	} else {
		if (!cssVariables.__map__[theme]) {
			Object.defineProperty(cssVariables.__map__, theme, {value: {}, enumerable: false});
		}

		cssVariables.__map__[theme][path] = mapValue;
	}
}

/**
 * Returns path with a dot delimiter between prefix and suffix
 *
 * @param {string} prefix
 * @param {string} suffix
 * @returns {string}
 */
function createPath(prefix, suffix) {
	return `${prefix ? `${prefix}.${suffix}` : suffix}`;
}

/**
 * Converts object prop values to Stylus values
 *
 * @param {Object} data
 * @param {string} [path]
 * @param {string|boolean} [theme]
 */
function prepareData(data, path, theme) {
	$C(data).forEach((d, val) => {
		if (theme === true) {
			if (Object.isObject(d)) {
				prepareData(d, path, val);

			} else {
				throw new Error('Cannot find theme dictionary');
			}

		} else if (val === 'theme') {
			/*
			 * @example
			 *
			 * {
			 *   bButton: {
			 *     theme: {
			 *       dark: d
			 *     }
			 *   }
			 * }}
			 */
			if (Object.isObject(d)) {
				prepareData(d, path, true);

			} else {
				throw new Error('Cannot find themes dictionary');
			}

		} else if (Object.isObject(d)) {
			prepareData(d, createPath(path, val), theme);

		} else if (Object.isArray(d)) {
			prepareData(d, createPath(path, val), theme);
			d = stylus.utils.coerceArray(d, true);

		} else {
			if (/^[a-z-_]+\(.*\)$/.test(d)) {
				// Stylus built-in function
				data[val] = new stylus.Parser(d).function();
				saveVariable(createPath(path, val), data[val], theme);
				return;
			}

			if (/^#(?=[0-9a-fA-F]*$)(?:.{3,4}|.{6}|.{8})$/.test(d)) {
				// HEX value
				data[val] = new stylus.Parser(d).peek().val;
				saveVariable(createPath(path, val), data[val], theme);
				return;
			}

			if (Object.isString(d)) {
				const
					reg = /(\d+(?:\.\d+)?)(?=(px|em|rem|%)$)/,
					unit = d.match(reg);

				if (unit) {
					// Value with unit
					data[val] = new stylus.nodes.Unit(parseFloat(unit[1]), unit[2]);
					saveVariable(createPath(path, val), data[val], theme);
					return;
				}

				data[val] = new stylus.nodes.String(d);
				saveVariable(createPath(path, val), data[val], theme);
				return;
			}

			data[val] = new stylus.nodes.Unit(d);
			saveVariable(createPath(path, val), data[val], theme);
		}
	});
}

/**
 * Returns array of fields to get themed value
 *
 * @param field
 * @returns {string[]}
 */
function getThemedPathChunks(field) {
	let
		path = ['theme', theme];

	if (Object.isArray(themedFields) && !themedFields.includes(field)) {
		// Requested field does not themed
		path = [];
	}

	return path;
}

module.exports = {
	saveVariable,
	prepareData,
	createPath,
	getThemedPathChunks
};
