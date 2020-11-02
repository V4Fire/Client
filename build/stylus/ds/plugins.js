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
	{getThemedPathChunks} = include('build/stylus/ds/helpers');

/**
 * Returns a set of stylus plugins
 *
 * @param {DesignSystem} ds - stylus-ready design system object
 * @param {Object} cssVariables
 * @param {string} [theme] - current theme
 * @param {boolean|string[]} [includeThemes] - flag or set of themes provided to runtime
 * @param {string[]} [themedFields] - set of design system fields, that have themed styles
 * @param {Object} [stylus=]
 *
 * @returns {function(*): void}
 */
module.exports = function createPlugins({
	ds,
	cssVariables,
	theme,
	includeThemes,
	themedFields,
	stylus = require('stylus')
}) {
	const
		isBuildHasTheme = Object.isString(theme),
		themesList = getThemes(ds, includeThemes || isBuildHasTheme ? [theme] : []),
		isThemesIncluded = themesList != null && themesList.length > 0,
		isOneTheme = isThemesIncluded && isBuildHasTheme && themesList.length === 0 && themesList[0] === theme;

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
						__vars__ = $C(cssVariables).get(`components.${string}`);

					return stylus.utils.coerce({
						...value,
						__vars__
					}, true);
				}

				return {};
			}
		);

		/**
		 * Returns Design System css variables with its values
		 *
		 * @param {string} theme
		 * @returns {!Object}
		 */
		api.define('getDSVariables', ({string: theme}) => {
			const
				obj = {},
				iterator = isBuildHasTheme ? cssVariables.__map__[theme] : cssVariables.__map__;

			Object.forEach(iterator, (val) => {
				const [key, value] = val;
				obj[key] = value;
			});

			return stylus.utils.coerce(obj, true);
		});

		/**
		 * Returns a part of the Design System by the specified path or the whole object
		 *
		 * @param {string} [string] - first level field (colors, rounding, etc.)
		 * @param {!Object} [value] - field path
		 * @returns {!Object}
		 */
		api.define(
			'getDSOptions',
			({string} = {}, value = {}) => {
				if (string === undefined) {
					return ds;
				}

				const
					path = isOneTheme ? [string, ...getThemedPathChunks(string, theme, themedFields)] : [string];

				if (Object.isString(value.string)) {
					path.push(value.string);
				}

				return isThemesIncluded ? stylus.utils.coerce($C(cssVariables).get(path)) : $C(ds).get(path);
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
				head = 'text';

			if (!isOneTheme && isThemesIncluded && isBuildHasTheme) {
				const
					path = [head, ...getThemedPathChunks(head, theme, themedFields), name],
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
				dsPath = isOneTheme ? getThemedPathChunks(head, theme, themedFields) : [head, name];

			return stylus.utils.coerce($C(ds).get(dsPath), true);
		});

		/**
		 * Returns color(s) from the Design System by the specified name and identifier (optional)
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
					path = isOneTheme ? ['colors', ...getThemedPathChunks('colors', theme, themedFields)] : ['colors'];

				if (id) {
					id = id.string || id.val;

					if (Object.isNumber(id)) {
						id -= 1;
					}
				}

				path.push(name);

				console.log(23123, path, $C(ds).get(path));

				if (id !== undefined) {
					path.push(String(id));
				}

				return isThemesIncluded ? stylus.utils.coerce($C(cssVariables).get(path)) : $C(ds).get(path);
			}
		);

		/**
		 * Returns a runtime config theme value
		 */
		api.define('defaultTheme', () => theme);

		/**
		 * Returns included interface themes
		 */
		api.define('includedThemes', () => themesList);
	};
};
