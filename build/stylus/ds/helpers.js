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
	stylus = require('stylus');

/**
 * Sets a variable into specified dictionary by the specified path
 *
 * @param {Object} vars
 * @param {string} path
 * @param {unknown} dsValue
 * @param {string} [theme]
 */
function saveVariable(vars, path, dsValue, theme) {
	const
		variable = `--${path.split('.').join('-')}`,
		mapValue = [variable, dsValue];

	$C(vars).set(`var(${variable})`, path);

	if (theme === undefined) {
		vars.__map__[path] = mapValue;

	} else {
		if (!vars.__map__[theme]) {
			Object.defineProperty(vars.__map__, theme, {value: {}, enumerable: false});
		}

		vars.__map__[theme][path] = mapValue;
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
 * Converts raw design system data to the project design system
 *
 * @param {DesignSystem} raw
 * @returns {{variables: Object, data: DesignSystem}}
 */
function createDesignSystem(raw) {
	const
		data = $C.clone(raw),
		variables = Object.create(null);

	Object.defineProperty(variables, '__map__', {
		enumerable: false,
		value: {}
	});

	return convertProps(data, variables);
}

/**
 * Converts object prop values to Stylus values
 *
 * @param {DesignSystem} data
 * @param {Object} variables
 * @param {string} [path]
 * @param {string|boolean} [theme]
 */
function convertProps(data, variables, path, theme) {
	$C(data).forEach((d, val) => {
		if (theme === true) {
			if (Object.isObject(d)) {
				convertProps(d, variables, path, val);

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
				convertProps(d, variables, path, true);

			} else {
				throw new Error('Cannot find themes dictionary');
			}

		} else if (Object.isObject(d)) {
			convertProps(d, variables, createPath(path, val), theme);

		} else if (Object.isArray(d)) {
			convertProps(d, variables, createPath(path, val), theme);
			d = stylus.utils.coerceArray(d, true);

		} else {
			if (/^[a-z-_]+\(.*\)$/.test(d)) {
				// Stylus built-in function
				data[val] = new stylus.Parser(d).function();
				saveVariable(variables, createPath(path, val), data[val], theme);
				return;
			}

			if (/^#(?=[0-9a-fA-F]*$)(?:.{3,4}|.{6}|.{8})$/.test(d)) {
				// HEX value
				data[val] = new stylus.Parser(d).peek().val;
				saveVariable(variables, createPath(path, val), data[val], theme);
				return;
			}

			if (Object.isString(d)) {
				const
					reg = /(\d+(?:\.\d+)?)(?=(px|em|rem|%)$)/,
					unit = d.match(reg);

				if (unit) {
					// Value with unit
					data[val] = new stylus.nodes.Unit(parseFloat(unit[1]), unit[2]);
					saveVariable(variables, createPath(path, val), data[val], theme);
					return;
				}

				data[val] = new stylus.nodes.String(d);
				saveVariable(variables, createPath(path, val), data[val], theme);
				return;
			}

			data[val] = new stylus.nodes.Unit(d);
			saveVariable(variables, createPath(path, val), data[val], theme);
		}
	});

	return {data, variables};
}

/**
 * Returns array of fields to get themed value
 *
 * @param {string} field
 * @param {string} theme
 * @param {string[]} [fieldsWithTheme]
 *
 * @returns {string[]}
 */
function getThemedPathChunks(field, theme, fieldsWithTheme) {
	let
		path = ['theme', theme];

	if (Object.isArray(fieldsWithTheme) && !fieldsWithTheme.includes(field)) {
		// Requested field does not themed
		path = [];
	}

	return path;
}

module.exports = {
	saveVariable,
	createDesignSystem,
	createPath,
	getThemedPathChunks
};
