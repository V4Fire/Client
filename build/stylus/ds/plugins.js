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

const
	{getThemes} = include('build/ds'),
	{getThemedPathChunks, checkDeprecated} = include('build/stylus/ds/helpers');

/**
 * Returns a set of stylus plugins by the specified options
 *
 * @param {DesignSystem} ds - design system object, prepared to use with `stylus`
 * @param {Object} cssVariables
 * @param {string} [theme] - current theme
 * @param {boolean} [includeVars] - true, if need to provide values only as css-variables
 * @param {boolean|string[]} [includeThemes] - flag or set of themes provided to runtime
 * @param {Object} [stylus=] - link to a `stylus` package instance
 *
 * @returns {function(*): void}
 */
module.exports = function getPlugins({
	ds,
	cssVariables,
	theme,
	includeVars,
	includeThemes,
	stylus = require('stylus')
}) {
	const
		isBuildHasTheme = Object.isString(theme),
		themedFields = $C(ds).get('meta.themedFields') || undefined;

	let
		buildThemes = includeThemes;

	if (!buildThemes) {
		buildThemes = isBuildHasTheme ? [theme] : [];
	}

	const
		themesList = getThemes(ds.raw, buildThemes),
		isThemesIncluded = themesList != null && themesList.length > 0,
		isOneTheme = Object.isArray(themesList) && themesList.length === 1 && themesList[0] === theme;

	if (Object.isString(theme) && !isThemesIncluded) {
		console.log(`[stylus] Warning: design system package has no theme "${theme}"`);
	}

	if (includeThemes != null && !isThemesIncluded) {
		console.log(
			`[stylus] Warning: design system package has no themes for the specified includeThemes value: "${includeThemes}"`
		);
	}

	const
		isFieldThemed = (name) => Object.isArray(themedFields) ? themedFields.includes(name) : true;

	return function addPlugins(api) {
		/**
		 * Injects additional options to component options ($p)
		 *
		 * @param {string} string - component name
		 * @returns {!Object}
		 */
		api.define(
			'injector',
			({string}) => {
				const
					value = $C(ds).get(`components.${string}`);

				if (value) {
					const
						__vars__ = $C(cssVariables).get(`components.${string}`),
						__diffVars__ = $C(cssVariables).get(`diff.components.${string}`);

					return stylus.utils.coerce({
						...value,
						__vars__,
						__diffVars__
					}, true);
				}

				return {};
			}
		);

		/**
		 * Returns design system css variables with its values
		 *
		 * @param {string} [theme]
		 * @returns {!Object}
		 */
		api.define('getDSVariables', ({string: theme} = {}) => {
			const
				obj = {},
				iterator = Object.isString(theme) ? cssVariables.map[theme] : cssVariables.map;

			Object.forEach(iterator, (val) => {
				const [key, value] = val;
				obj[key] = value;
			});

			return stylus.utils.coerce(obj, true);
		});

		/**
		 * Returns a part of a design system by the specified path
		 * or the whole object if path is not specified
		 *
		 * @param {string} [string] - first level field (colors, rounding, etc.)
		 * @param {!Object} [value] - field path
		 * @returns {!Object}
		 */
		api.define(
			'getDSFieldValue',
			({string} = {}, {string: value} = {}) => {
				if (string === undefined) {
					return ds;
				}

				checkDeprecated(ds, string);

				if (isOneTheme || !isBuildHasTheme) {
					return includeVars ?
						stylus.utils.coerce($C(cssVariables).get([].concat([string], value || []).join('.'))) :
						$C(ds).get([].concat(getThemedPathChunks(string, theme, isFieldThemed(string)), value || []).join('.'));
				}

				return stylus.utils.coerce($C(cssVariables).get([].concat([string], value || []).join('.')));
			}
		);

		/**
		 * Returns a text styles object for the specified text style name
		 *
		 * @param {string} [name]
		 * @returns {!Object}
		 */
		api.define('getDSTextStyles', ({string: name} = {}) => {
			if (!name) {
				throw new Error('getDSTextStyles: name for the text style is not specified');
			}

			const
				head = 'text',
				isThemed = isFieldThemed(head),
				path = [...getThemedPathChunks(head, theme, isThemed), name];

			checkDeprecated(ds, path);

			if (!isOneTheme && isThemesIncluded && isThemed) {
				const
					initial = $C(ds).get(path);

				if (!Object.isObject(initial)) {
					throw new Error(`getDSTextStyles: design system has no "${theme}" styles for the specified name: ${name}`);
				}

				const
					res = {};

				Object.forEach(initial, (value, key) => {
					res[key] = $C(cssVariables).get([head, name, key]);
				});

				return stylus.utils.coerce(res, true);
			}

			const
				from = includeVars ? cssVariables : ds;

			return stylus.utils.coerce($C(from).get(path), true);
		});

		/**
		 * Returns color(s) from a design system by the specified name and the specified identifier (optional)
		 *
		 * @param {!Object} name
		 * @param {!Object} [id]
		 * @returns {(!Object|!Array)}
		 */
		api.define(
			'getDSColor',
			(name, id) => {
				name = name.string || name.name;

				if (!name) {
					return;
				}

				const
					path = isOneTheme ? getThemedPathChunks('colors', theme, isFieldThemed('colors')) : ['colors'];

				if (id) {
					id = id.string || id.val;

					if (Object.isNumber(id)) {
						id -= 1;
					}
				}

				path.push(name);

				if (id !== undefined) {
					path.push(String(id));
				}

				checkDeprecated(ds, path);

				return isThemesIncluded || includeVars ? stylus.utils.coerce($C(cssVariables).get(path)) : $C(ds).get(path);
			}
		);

		/**
		 * Returns a current build theme
		 * @returns {!string}
		 */
		api.define('defaultTheme', () => theme);

		/**
		 * Returns themes, available in the environment
		 * @returns {!string[]}
		 */
		api.define('availableThemes', () => themesList);
	};
};
