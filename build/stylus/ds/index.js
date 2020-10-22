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
	pzlr = require('@pzlr/build-core');

const
	config = require('config'),
	{theme} = config.runtime(),
	{getThemes} = include('build/ds');

const {
	saveVariable,
	createPath,
	prepareData
} = include('build/stylus/ds/helpers');

const {
	DS,
	cssVariables
} = include('build/stylus/ds/const');

if (pzlr.config.designSystem) {
	try {
		const d = require(pzlr.config.designSystem);
		Object.assign(DS, $C.clone(d));

	} catch {
		console.log(`[stylus] Can't find "${pzlr.config.designSystem}" design system package`);
	}

} else {
	console.log('[stylus] Design system package is not specified');
}

prepareData(DS);

const
	themesList = getThemes(),
	isThemesIncluded = Boolean(themesList);

module.exports = function addPlugins(api) {
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
				value = $C(DS).get(`components.${string}`);

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
			iterator = theme ? cssVariables.__map__[theme] : cssVariables.__map__;

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
				return DS;
			}

			const
				path = !isThemesIncluded && theme ? [string, 'theme', theme] : [string];

			if (Object.isString(value.string)) {
				path.push(value.string);
			}

			return isThemesIncluded ? stylus.utils.coerce($C(cssVariables).get(path)) : $C(DS).get(path);
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

		if (isThemesIncluded && theme) {
			const
				path = ['text', 'theme', theme, name],
				initial = $C(DS).get(path);

			if (!Object.isObject(initial)) {
				throw new Error(`getDSTextStyles: design system has no "${theme}" styles for the specified name: ${name}`);
			}

			const
				res = {};

			Object.forEach(initial, (value, key) => {
				res[key] = $C(cssVariables).get(['text', name, key]);
			});

			return stylus.utils.coerce(res, true);
		}

		const
			tail = !isThemesIncluded && theme ? ['theme', theme, name] : [name];

		return $C(DS).get(['text', ...tail]);
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
				path = !isThemesIncluded && theme ? ['colors', 'theme', theme] : ['colors'];

			if (id) {
				id = id.string || id.val;

				if (Object.isNumber(id)) {
					id -= 1;
				}
			}

			path.push(name);

			if (id !== undefined) {
				path.push(id);
			}

			return isThemesIncluded ? stylus.utils.coerce($C(cssVariables).get(path)) : $C(DS).get(path);
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

Object.assign(module.exports, {
	saveVariable,
	createPath,
	prepareData
});

