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
 * Saves the specified value as css variable into the specified dictionary by the specified path
 *
 * @param {DesignSystemVariables} varDict - css variables dictionary
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
 * @returns {!BuildTimeDesignSystemParams}
 */
function createDesignSystem(raw, stylus = require('stylus')) {
	const
		base = Object.create(Object.freeze({meta: raw.meta, raw})),
		rawCopy = $C.clone(raw);

	$C(rawCopy).remove('meta');

	const
		{data, variables} = convertToBuildTimeUsableObject(stylus, rawCopy),
		extendParams = {withProto: true, withAccessors: true};

	return {data: $C.extend(extendParams, base, data), variables};
}

/**
 * Converts the specified design system object to a Stylus object
 * and creates css variables to use in style files
 *
 * @param {Object} stylus - link to a stylus package instance
 * @param {DesignSystem} ds
 *
 * @returns {!BuildTimeDesignSystemParams}
 */
function convertToBuildTimeUsableObject(stylus, ds) {
	const
		variables = Object.create({map: {}}),
		data = $C.clone(ds);

	const
		builtInFnRgxp = /^[a-z-_]+\(.*\)$/,
		colorHEXRgxp = /^#(?=[0-9a-fA-F]*$)(?:.{3,4}|.{6}|.{8})$/,
		unitRgxp = /(\d+(?:\.\d+)?)(?=(px|em|rem|%)$)/;

	convert(data);
	return {data, variables};

	/**
	 * @param {Object.<string, any>} data
	 * @param [path]
	 * @param [theme]
	 */
	function convert(data, path, theme) {
		$C(data).forEach((value, key) => {
			if (theme === true) {
				if (Object.isObject(value)) {
					convert(value, path, key);

				} else {
					throw new Error('Cannot find a theme dictionary');
				}

			} else if (key === 'theme') {
				/*
				 * @example
				 *
				 * {
				 *   bButton: {
				 *     theme: {
				 *       dark: value
				 *     }
				 *   }
				 * }}
				 */
				if (Object.isObject(value)) {
					convert(value, path, true);

				} else {
					throw new Error('Cannot find themes dictionary');
				}

			} else if (Object.isObject(value)) {
				convert(value, getVariablePath(path, key), theme);

			} else if (Object.isArray(value)) {
				convert(value, getVariablePath(path, key), theme);
				value = stylus.utils.coerceArray(value, true);

			} else {
				if (builtInFnRgxp.test(value)) {
					const
						parsed = new stylus.Parser(value, {cache: false});

					data[key] = parsed.function();
					saveVariable(variables, getVariablePath(path, key), data[key], theme);
					return;
				}

				if (colorHEXRgxp.test(value)) {
					data[key] = new stylus.Parser(value, {cache: false}).peek().key;
					saveVariable(variables, getVariablePath(path, key), data[key], theme);
					return;
				}

				if (Object.isString(value)) {
					const
						unit = value.match(unitRgxp);

					if (unit) {
						data[key] = new stylus.nodes.Unit(String(parseFloat(unit[1])), unit[2]);
						saveVariable(variables, getVariablePath(path, String(key)), data[key], theme);
						return;
					}

					data[key] = new stylus.nodes.String(value);
					saveVariable(variables, getVariablePath(path, String(key)), data[key], theme);
					return;
				}

				data[key] = new stylus.nodes.Unit(value);
				saveVariable(variables, getVariablePath(path, String(key)), data[key], theme);
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
	if (!Object.isObject($C(ds).get('meta.deprecated'))) {
		return false;
	}

	const
		strPath = Object.isString(path) ? path : path.join('.'),
		deprecated = ds.meta.deprecated[strPath];

	if (deprecated == null) {
		return false;
	}

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

module.exports = {
	saveVariable,
	checkDeprecated,
	getVariableName,
	createDesignSystem,
	getVariablePath,
	getThemedPathChunks
};
