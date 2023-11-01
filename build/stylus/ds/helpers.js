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
 * Returns a name of a CSS variable, created from the specified path with a dot delimiter
 *
 * @param {!Array<string>} path
 * @returns {string}
 *
 * @example
 * ```
 * getVariableName(['a', 'b']) // --a-b
 * ```
 */
function getVariableName(path) {
	return `--${path.join('-')}`;
}

/**
 * Saves the specified value as a CSS variable into a dictionary by the specified path
 *
 * @param {?} value
 * @param {!Array<string>} path - path to set the value
 * @param {DesignSystemVariables} varStorage - dictionary of CSS variables
 * @param {string=} [mapGroup] - name of a group within the `map` property of the variable storage
 *
 * @example
 * ```
 * saveVariable('blue', ['a', 'b'], cssVars)
 * ```
 */
function saveVariable(value, path, varStorage, mapGroup) {
	const
		variable = getVariableName(path),
		joinedPath = path.join('.'),
		mapValue = [variable, value];

	$C(varStorage).set(`var(${variable})`, path);
	$C(varStorage).set(`var(${variable}-diff)`, `diff.${joinedPath}`);

	if (mapGroup === undefined) {
		varStorage.map[joinedPath] = mapValue;

	} else {
		if (!varStorage.map[mapGroup]) {
			Object.defineProperty(varStorage.map, mapGroup, {value: {}, enumerable: false});
		}

		varStorage.map[mapGroup][joinedPath] = mapValue;
	}
}

/**
 * Creates a project design system from the specified raw object
 *
 * @param {DesignSystem} raw
 * @param {Object=} [stylus]
 * @returns {!BuildTimeDesignSystemParams}
 */
function createDesignSystem(raw, stylus = require('stylus')) {
	const
		base = Object.create(Object.freeze({meta: raw.meta, raw})),
		rawCopy = Object.mixin(true, {}, raw);

	delete rawCopy.meta;

	const {
		data,
		variables
	} = convertDsToBuildTimeUsableObject(rawCopy, stylus);

	return {data: Object.mixin({withProto: true, withDescriptors: 'onlyAccessors'}, base, data), variables};
}

/**
 * Converts the specified design system object to a Stylus object
 * and creates CSS variables to use within `.styl` files
 *
 * @param {DesignSystem} ds
 * @param {Object} stylus - link to a stylus package instance
 * @returns {!BuildTimeDesignSystemParams}
 */
function convertDsToBuildTimeUsableObject(ds, stylus) {
	const
		variables = Object.create({map: {}});

	const
		builtinFnRgxp = /^[a-z-_]+\(.*\)$/,
		colorHEXRgxp = /^#(?=[0-9a-fA-F]*$)(?:.{3,4}|.{6}|.{8})$/,
		unitRgxp = /(\d+(?:\.\d+)?)(?=(px|em|rem|%)$)/;

	const
		data = parseRawDS(ds);

	return {data, variables};

	/**
	 * @param {!Array<string>} keys
	 * @param {string} theme
	 */
	function getVariablePath(keys, theme) {
		return keys.filter((field) => !['theme', theme].includes(field));
	}

	/**
	 * Creates an array of key chunks from the passed head and tail
	 *
	 * @param {?Array} head
	 * @param {string|number} tail
	 * @returns {!Array<string>}
	 *
	 * @example
	 * ```js
	 * createArrayFrom(['deep', 'path', 'to'], 'variable', 'name') // ['deep', 'path', 'to', 'variable', 'name']
	 * ```
	 */
	function createArrayFrom(head, ...tail) {
		return [...(head || []), ...tail];
	}

	/**
	 * @param {Object} obj
	 * @param {(Object|Array)=} [res]
	 * @param {Array<string>=} [path]
	 * @param {(string|boolean)=} [theme]
	 */
	function parseRawDS(obj, res, path, theme) {
		if (!res) {
			res = {};
		}

		$C(obj).forEach((value, key) => {
			if (theme === true) {
				if (Object.isDictionary(value)) {
					parseRawDS(value, res, createArrayFrom(path, key), key);

				} else {
					throw new Error('Cannot find a theme dictionary');
				}

			} else if (key === 'theme') {
				if (Object.isDictionary(value)) {
					parseRawDS(value, res, createArrayFrom(path, key), true);

				} else {
					throw new Error('Cannot find themes dictionary');
				}

			} else if (Object.isDictionary(value)) {
				parseRawDS(value, res, createArrayFrom(path, key), theme);

			} else if (Object.isArray(value)) {
				const
					array = parseRawDS(value, [], [], theme);

				array.forEach((el, i) => {
					const
						variablePath = getVariablePath(path, theme);

					saveVariable(el, createArrayFrom(variablePath, key, i), variables, theme);
				});

				$C(res).set(array, createArrayFrom(path, key));

			} else {
				const
					keyPath = createArrayFrom(path, key);

				let
					parsed;

				if (builtinFnRgxp.test(value)) {
					parsed = new stylus.Parser(value, {cache: false}).function();

				} else if (colorHEXRgxp.test(value)) {
					parsed = new stylus.Parser(value, {cache: false}).peek().key;

				} else if (Object.isString(value)) {
					const
						unit = value.match(unitRgxp);

					parsed = unit != null ? new stylus.nodes.Unit(parseFloat(unit[1]), unit[2]) : new stylus.nodes.String(value);

				} else {
					parsed = new stylus.nodes.Unit(value);
				}

				$C(res).set(parsed, keyPath);

				if (path && path.length > 0) {
					const
						variablePath = getVariablePath(keyPath, theme);

					saveVariable(parsed, variablePath, variables, theme);
				}
			}
		});

		return res;
	}
}

/**
 * Returns path chunks to get a themed value from the design system
 *
 * @param {string} field
 * @param {string} [theme]
 * @param {boolean} [isFieldThemed] - true, if a value of the specified field depends on the theme
 * @returns {!Array<string>}
 *
 * @example
 * ```js
 * getThemedPathChunks('colors', 'light', true) // ['colors', 'theme', 'light']
 * getThemedPathChunks('colors', 'light') // ['colors']
 * ```
 */
function getThemedPathChunks(field, theme, isFieldThemed) {
	if (isFieldThemed !== true) {
		return [field];
	}

	return theme != null ? [field, 'theme', theme] : [field];
}

/**
 * Checks the specified path to a field for obsolescence at the design system
 *
 * @param {!DesignSystem} ds
 * @param {(string|!Array<string>)} path
 */
function checkDeprecated(ds, path) {
	if (!Object.isDictionary($C(ds).get('meta.deprecated'))) {
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

	if (Object.isDictionary(deprecated)) {
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
	getThemedPathChunks
};
