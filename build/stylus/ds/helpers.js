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
 * Returns a name of the CSS variable, created from the specified path with a dot delimiter
 *
 * @param {string} path
 * @returns {string}
 */
function getVariableName(path) {
	return `--${path.split('.').join('-')}`;
}

/**
 * Sets a variable into the specified variables dictionary by the specified path
 *
 * @param {Object} varDict - variables dictionary
 * @param {string} path - path to set a value
 * @param {unknown} value
 * @param {string} [theme]
 */
function saveVariable(varDict, path, value, theme) {
	const
		variable = getVariableName(path),
		mapValue = [variable, value];

	$C(varDict).set(`var(${variable})`, path);
	$C(varDict).set(`var(${variable}-diff)`, `diff.${path}`);

	if (theme === undefined) {
		varDict.map[path] = mapValue;

	} else {
		if (!varDict.map[theme]) {
			Object.defineProperty(varDict.map, theme, {value: {}, enumerable: false});
		}

		varDict.map[theme][path] = mapValue;
	}
}

/**
 * Returns a path to the specified variable name
 *
 * @param {?string} prefix
 * @param {string} name
 *
 * @returns {string}
 */
function getVariablePath(prefix, name) {
	return `${prefix ? `${prefix}.${name}` : name}`;
}

/**
 * Creates a project design system from the specified raw object
 *
 * @param {DesignSystem} raw
 * @param {Object} [stylus=]
 *
 * @returns {{data: DesignSystem, variables: Object}}
 */
function createDesignSystem(raw, stylus = require('stylus')) {
	const
		base = Object.create(Object.freeze({meta: raw.meta, raw})),
		variables = Object.create({map: {}}),
		rawCopy = $C.clone(raw);

	$C(rawCopy).remove('meta');

	const
		designSystem = convertToStylusObject(stylus, rawCopy, variables),
		extendParams = {withProto: true, withAccessors: true};

	return {data: $C.extend(extendParams, base, designSystem), variables};
}

/**
 * Converts the specified Javascript object to a Stylus object (recursively)
 *
 * @param {Object} stylus - link to stylus package instance
 * @param {DesignSystem} ds
 * @param {Object} variables
 *
 * @returns {!DesignSystem}
 */
function convertToStylusObject(stylus, ds, variables) {
	const
		result = $C.clone(ds);

	convert(result);
	return result;

	function convert(data, path, theme) {
		$C(data).forEach((d, val) => {
			if (theme === true) {
				if (Object.isObject(d)) {
					convert(d, path, val);

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
					convert(d, path, true);

				} else {
					throw new Error('Cannot find themes dictionary');
				}

			} else if (Object.isObject(d)) {
				convert(d, getVariablePath(path, val), theme);

			} else if (Object.isArray(d)) {
				convert(d, getVariablePath(path, val), theme);
				d = stylus.utils.coerceArray(d, true);

			} else {
				if (/^[a-z-_]+\(.*\)$/.test(d)) {
					// Built-in function

					const
						parsed = new stylus.Parser(d, {cache: false});

					data[val] = parsed.function();
					saveVariable(variables, getVariablePath(path, val), data[val], theme);
					return;
				}

				if (/^#(?=[0-9a-fA-F]*$)(?:.{3,4}|.{6}|.{8})$/.test(d)) {
					// HEX value
					data[val] = new stylus.Parser(d, {cache: false}).peek().val;
					saveVariable(variables, getVariablePath(path, val), data[val], theme);
					return;
				}

				if (Object.isString(d)) {
					const
						reg = /(\d+(?:\.\d+)?)(?=(px|em|rem|%)$)/,
						unit = d.match(reg);

					if (unit) {
						// Value with unit
						data[val] = new stylus.nodes.Unit(String(parseFloat(unit[1])), unit[2]);
						saveVariable(variables, getVariablePath(path, String(val)), data[val], theme);
						return;
					}

					data[val] = new stylus.nodes.String(d);
					saveVariable(variables, getVariablePath(path, String(val)), data[val], theme);
					return;
				}

				data[val] = new stylus.nodes.Unit(d);
				saveVariable(variables, getVariablePath(path, String(val)), data[val], theme);
			}
		});
	}
}

/**
 * Returns array of fields to get a themed value
 *
 * @param {string} field
 * @param {string} [theme]
 * @param {boolean} [isFieldThemed]
 *
 * @returns {!Array<string>}
 */
function getThemedPathChunks(field, theme, isFieldThemed) {
	if (!theme) {
		return [field];
	}

	return isFieldThemed ? [field, 'theme', theme] : [field];
}

/**
 * Checks the specified path to a field for obsolescence at the design system
 *
 * @param {!DesignSystem} ds
 * @param {(string|!Array<string>)} path
 */
function checkDeprecated(ds, path) {
	if (Object.isObject($C(ds).get('meta.deprecated'))) {
		const
			strPath = Object.isString(path) ? path : path.join('.'),
			deprecated = ds.meta.deprecated[strPath];

		if (deprecated != null) {
			const
				message = [];

			if (Object.isObject(deprecated)) {
				if (deprecated.renamedTo != null) {
					message.push(
						`[stylus] Warning: design system field by path "${strPath}" was renamed to "${deprecated.renamedTo}".`,
						'Please use the renamed version instead of the current, because it will be removed from the next major release.'
					);

				} else if (deprecated.alternative != null) {
					message.push(
						`[stylus] Warning: design system field by path "${strPath}" was deprecated and will be removed from the next major release.`
					);

					message.push(`Please use "${deprecated.alternative}" instead.`);
				}

				if (deprecated.notice != null) {
					message.push(deprecated.notice);
				}

			} else {
				message.push(
					`[stylus] Warning: design system field by path "${strPath}" was deprecated and will be removed from the next major release.`
				);
			}

			console.warn(...message);
			return true;
		}
	}

	return false;
}

module.exports = {
	saveVariable,
	checkDeprecated,
	getVariableName,
	createDesignSystem,
	getVariablePath,
	getThemedPathChunks
};
