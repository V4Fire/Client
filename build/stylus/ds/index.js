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
	runtime = config.runtime(),
	{includedThemes} = runtime;

const {
	setVar,
	genPath,
	prepareData
} = include('build/stylus/ds/helpers');

const {
	DS,
	cssVars
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
	THEME = runtime.theme,
	INCLUDED_THEMES = includedThemes === true ? DS.meta.includedThemes : includedThemes;

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
					__vars__ = $C(cssVars).get(`components.${string}`);

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
	api.define('getFlatDSVars', ({string: theme}) => {
		const
			obj = {},
			iterator = theme ? cssVars.__map__[theme] : cssVars.__map__;

		Object.forEach(iterator, (val) => {
			const [key, value] = val;
			obj[key] = value;
		});

		return stylus.utils.coerce(obj, true);
	});

	/**
	 * Returns a part of the Design System by the specified path or the whole DS object
	 *
	 * @param {string} [string] - first level field (colors, rounding, etc.)
	 * @param {value} [string] - field path
	 * @returns {!Object}
	 */
	api.define(
		'getDSOptions',
		({string} = {}, value = {}) => {
			if (string === undefined) {
				return DS;
			}

			const
				hasIncludedThemes = Boolean(INCLUDED_THEMES);

			let
				path;

			if (!hasIncludedThemes && THEME) {
				path = [string, 'theme', THEME];

			} else {
				path = [string];
			}

			if (value.string) {
				path.push(value.string);
			}

			return hasIncludedThemes ? stylus.utils.coerce($C(cssVars).get(path)) : $C(DS).get(path);
		}
	);

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
				hasIncludedThemes = Boolean(INCLUDED_THEMES),
				path = !hasIncludedThemes && THEME ? ['colors', 'theme', THEME] : ['colors'];

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

			return hasIncludedThemes ? stylus.utils.coerce($C(cssVars).get(path)) : $C(DS).get(path);
		}
	);

	/**
	 * Returns a runtime config theme value
	 */
	api.define('defaultTheme', () => THEME);

	/**
	 * Returns included interface themes
	 */
	api.define('includedThemes', () => INCLUDED_THEMES);
};

Object.assign(module.exports, {
	setVar,
	genPath,
	prepareData
});

