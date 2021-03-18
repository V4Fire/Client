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
 * Returns a function to register Stylus plugins by the specified options
 *
 * @param {DesignSystem} ds - design system object prepared to use with Stylus
 * @param {!Object} cssVariables - dictionary of CSS variables
 * @param {boolean=} [includeVars] - true, if Design System values provided to style files as css-variables
 *
 * @param {string=} [theme] - current theme value
 * @param {(Array<string>|boolean)=} [includeThemes] - list of themes to include or
 *   `true` (will include all available themes)
 *
 * @param {Object=} [stylus] - link to a Stylus package instance
 * @returns {!Function}
 */
module.exports = function getPlugins({
	ds,
	cssVariables,
	includeVars,
	theme,
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

	if (!isThemesIncluded) {
		if (Object.isString(theme)) {
			console.log(`[stylus] Warning: the design system package has no theme "${theme}"`);
		}

		if (includeThemes != null) {
			console.log(
				`[stylus] Warning: the design system package has no themes for the provided "includeThemes" value: "${includeThemes}"`
			);
		}
	}

	const
		isFieldThemed = (name) => Object.isArray(themedFields) ? themedFields.includes(name) : true;

	return function addPlugins(api) {
		/**
		 * Injects additional options to component mixin options ($p)
		 *
		 * @param {string} string - component name
		 *
		 * @example
		 * ```stylus
		 * injector('bButton')
		 *
		 * // If variables has been switched on for the build
		 * //
		 * // {
		 * //   values: {
		 * //     mods: {
		 * //       size: {
		 * //         s: {
		 * //           offset: {
		 * //             top: 'var(--bButton-mods-size-s-offset-top)'
		 * //           }
		 * //         }
		 * //       }
		 * //     }
		 * //   }
		 *
		 * // Otherwise. All values are stylus types
		 * //
		 * // {
		 * //   values: {
		 * //     mods: {
		 * //       size: {
		 * //         s: {
		 * //           offset: {
		 * //             top: 5px
		 * //           }
		 * //         }
		 * //       }
		 * //     }
		 * //   }
		 * ```
		 *
		 * @returns {!Object}
		 */
		api.define('injector', ({string}) => {
			const
				values = $C(includeVars || isThemesIncluded ? cssVariables : ds).get(`components.${string}`);

			if (values) {
				const
					__diffVars__ = $C(cssVariables).get(`diff.components.${string}`);

				return stylus.utils.coerce({
					values,
					__diffVars__
				}, true);
			}

			return {};
		});

		/**
		 * Returns design system CSS variables with their values
		 *
		 * @param {string} [theme]
		 *
		 * @example
		 * ```stylus
		 * getDSVariables()
		 *
		 * // {
		 * //   '--colors-primary': #0F9
		 * // }
		 * ```
		 *
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
		 * Return a value from the design system from the specified group by the specified path.
		 * If specified only the first argument, returns parameters object for the specified group.
		 * If all arguments is not specified, returns full design system object.
		 *
		 * @param {string} [group] - first level field name (colors, rounding, etc.)
		 * @param {!Object} [path] - dot-delimited path in the specified group
		 *
		 * @example
		 * ```stylus
		 * getDSValue(colors "green.0") // rgba(0, 255, 0, 1)
		 * ```
		 *
		 * @returns {!Object}
		 */
		api.define('getDSValue', ({string: group} = {}, {string: path} = {}) => {
			if (group === undefined) {
				return ds;
			}

			checkDeprecated(ds, group);

			const
				getCSSVar = () => $C(cssVariables).get([].concat([group], path || []).join('.'));

			if (isOneTheme || !isBuildHasTheme) {
				return includeVars ?
					stylus.utils.coerce(getCSSVar()) :
					$C(ds).get([].concat(getThemedPathChunks(group, theme, isFieldThemed(group)), path || []).join('.'));
			}

			return stylus.utils.coerce(getCSSVar());
		});

		/**
		 * Returns an object with text styles for the specified style name
		 *
		 * @param {string} name
		 *
		 * @example
		 * ```stylus
		 * getDSTextStyles(Small)
		 *
		 * // Notice: All values are stylus types
		 * //
		 * // {
		 * //  fontFamily: 'Roboto',
		 * //  fontWeight: 400,
		 * //  fontSize: '14px',
		 * //  lineHeight: '16px'
		 * // }
		 *
		 * ```
		 *
		 * @returns {!Object}
		 */
		api.define('getDSTextStyles', ({string: name}) => {
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
		 * Returns color(s) from the design system by the specified name and identifier (optional)
		 *
		 * @param {!Object} name
		 * @param {!Object} [id]
		 *
		 * @example
		 * ```stylus
		 * getDSColor("blue", 1) // rgba(0, 0, 255, 1)
		 * ```
		 *
		 * @returns {(!Object|!Array)}
		 */
		api.define('getDSColor', (name, id) => {
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
		});

		/**
		 * Returns a current theme value
		 * @returns {!string}
		 */
		api.define('defaultTheme', () => theme);

		/**
		 * Returns a list of available themes
		 * @returns {!Array<string>}
		 */
		api.define('availableThemes', () => themesList);
	};
};
