'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
	$C = require('collection.js');

/**
 * Returns a css variable name created
 * from the specified path with a dot delimiter
 *
 * @param {string} path
 * @returns {string}
 */
function createVariableName(path) {
	return `--${path.split('.').join('-')}`;
}

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
		variable = createVariableName(path),
		mapValue = [variable, dsValue];

	$C(vars).set(`var(${variable})`, path);
	$C(vars).set(`var(${variable}-diff)`, `diff.${path}`);

	if (theme === undefined) {
		vars.map[path] = mapValue;

	} else {
		if (!vars.map[theme]) {
			Object.defineProperty(vars.map, theme, {value: {}, enumerable: false});
		}

		vars.map[theme][path] = mapValue;
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
 * @param {Object} [stylus=]
 * @returns {{variables: Object, data: DesignSystem}}
 */
function createDesignSystem(raw, stylus = require('stylus')) {
	const
		proto = Object.freeze({meta: raw.meta, raw}),
		variables = Object.create({map: {}}),
		clonedRaw = $C.clone(raw);

	$C(clonedRaw).remove('meta');

	const data = $C.extend(
		{withProto: true, withAccessors: true},
		Object.create(proto),
		clonedRaw
	);

	convertProps(stylus, data, variables);

	return {data, variables};
}

/**
 * Converts object prop values to Stylus values recursively
 *
 * @param {Object} stylus
 * @param {DesignSystem} data
 * @param {Object} variables
 * @param {string} [path]
 * @param {string|boolean} [theme]
 */
function convertProps(stylus, data, variables, path, theme) {
	$C(data).forEach((d, val) => {
		if (theme === true) {
			if (Object.isObject(d)) {
				convertProps(stylus, d, variables, path, val);

			} else {
				throw new Error('Cannot find a theme dictionary');
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
				convertProps(stylus, d, variables, path, true);

			} else {
				throw new Error('Cannot find themes dictionary');
			}

		} else if (Object.isObject(d)) {
			convertProps(stylus, d, variables, createPath(path, val), theme);

		} else if (Object.isArray(d)) {
			convertProps(stylus, d, variables, createPath(path, val), theme);
			d = stylus.utils.coerceArray(d, true);

		} else {
			if (/^[a-z-_]+\(.*\)$/.test(d)) {
				// Built-in function

				const
					parsed = new stylus.Parser(d, {cache: false});

				data[val] = parsed.function();
				saveVariable(variables, createPath(path, val), data[val], theme);
				return;
			}

			if (/^#(?=[0-9a-fA-F]*$)(?:.{3,4}|.{6}|.{8})$/.test(d)) {
				// HEX value
				data[val] = new stylus.Parser(d, {cache: false}).peek().val;
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
}

/**
 * Returns array of fields to get themed value
 *
 * @param {string} field
 * @param {string} [theme]
 * @param {string[]} [fieldsWithTheme]
 *
 * @returns {string[]}
 */
function getThemedPathChunks(field, theme, fieldsWithTheme) {
	let
		path = [field];

	if (!theme) {
		return path;
	}

	if (Object.isArray(fieldsWithTheme) && !fieldsWithTheme.includes(field)) {
		// Requested field does not themed
		path = [field];

	} else {
		path = [field, 'theme', theme];
	}

	return path;
}

module.exports = {
	saveVariable,
	createVariableName,
	createDesignSystem,
	createPath,
	getThemedPathChunks
};
