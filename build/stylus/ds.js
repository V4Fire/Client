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
	it = runtime.includedThemes;

let
	DS = {};

const
	CSSVars = Object.create(null);

Object.defineProperty(CSSVars, '__map__', {
	enumerable: false,
	value: {}
});

if (pzlr.config.designSystem) {
	try {
		DS = require(pzlr.config.designSystem);

	} catch {
		console.log(`[stylus] Can't find "${pzlr.config.designSystem}" design system package`);
	}

} else {
	console.log('[stylus] Design system package is not specified');
}

/**
 * Sets a variable into CSSVars dictionary by the specified path
 *
 * @param {string} path
 * @param {unknown} dsValue
 * @param {string} [theme]
 */
function setVar(path, dsValue, theme) {
	const
		variable = `--${path.split('.').join('-')}`;

	const
		mapValue = [variable, dsValue];

	$C(CSSVars).set(`var(${variable})`, path);

	if (!theme) {
		CSSVars.__map__[path] = mapValue;

	} else {
		if (!CSSVars.__map__[theme]) {
			Object.defineProperty(CSSVars.__map__, theme, {value: {}, enumerable: false});
		}

		CSSVars.__map__[theme][path] = mapValue;
	}
}

/**
 * Returns path with a dot delimiter between prefix and suffix
 *
 * @param {string} prefix
 * @param {string|number} suffix
 * @returns {string}
 */
function genPath(prefix, suffix) {
	return `${prefix ? `${prefix}.${suffix}` : suffix}`;
}

/**
 * Converts object prop values to Stylus values
 *
 * @param {Object} data
 * @param {string=} [path]
 * @param {string|boolean=} [theme]
 */
function prepareData(data, path, theme) {
	$C(data).forEach((d, val) => {
		if (theme === true) {
			if (Object.isObject(d)) {
				if (theme === true) {
					prepareData(d, path, val);
				}

			} else {
				throw new Error('Cannot find theme dictionary');
			}

		} else if (val === 'theme') {
			if (Object.isObject(d)) {
				prepareData(d, path, true);

			} else {
				throw new Error('Cannot find themes dictionary');
			}

		} else if (Object.isObject(d)) {
			prepareData(d, genPath(path, val), theme);

		} else if (Object.isArray(d)) {
			prepareData(d, genPath(path, val), theme);
			d = stylus.utils.coerceArray(d, true);

		} else {
			if (/^[a-z-_]+\(.*\)$/.test(d)) {
				// Built-in function
				data[val] = new stylus.Parser(d).function();
				setVar(genPath(path, val), data[val], theme);
				return;
			}

			if (/^#(?=[0-9a-fA-F]*$)(?:.{3,4}|.{6}|.{8})$/.test(d)) {
				// HEX value
				data[val] = new stylus.Parser(d).peek().val;
				setVar(genPath(path, val), data[val], theme);
				return;
			}

			if (Object.isString(d)) {
				const
					reg = /(\d+(?:\.\d+)?)(?=(px|em|rem|%)$)/,
					unit = d.match(reg);

				if (unit) {
					// Value with unit
					data[val] = new stylus.nodes.Unit(parseFloat(unit[1]), unit[2]);
					setVar(genPath(path, val), data[val], theme);
					return;
				}

				data[val] = new stylus.nodes.String(d);
				setVar(genPath(path, val), data[val], theme);
				return;
			}

			data[val] = new stylus.nodes.Unit(d);
			setVar(genPath(path, val), data[val], theme);
		}
	});
}

prepareData(DS);

const
	THEME = runtime.theme,
	INCLUDED_THEMES = it && Object.isBoolean(it) ? DS.meta.includedThemes : it;

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
					__vars__ = $C(CSSVars).get(`components.${string}`);

				return stylus.utils.coerce({
					...value,
					__vars__
				}, true);
			}

			return {};
		}
	);

	/**
	 * Returns Design System css variables with values
	 *
	 * @param {string} theme
	 * @returns {!Object}
	 */
	api.define('getFlatDSVars', ({string: theme}) => {
		const
			obj = {},
			iterator = theme ? CSSVars.__map__[theme] : CSSVars.__map__;

		Object.forEach(iterator, (val) => {
			const [key, value] = val;
			obj[key] = value;
		});

		return stylus.utils.coerce(obj, true);
	});

	/**
	 * Returns a part of the Design System by the specified path or the whole DS object
	 *
	 * @param {string} [string] - field path
	 * @returns {!Object}
	 */
	api.define(
		'getDSOptions',
		({string} = {}) => string ? stylus.utils.coerce($C(DS).get(string), true) || {} : DS
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

			return hasIncludedThemes ? stylus.utils.coerce($C(CSSVars).get(path)) : $C(DS).get(path);
		}
	);

	/**
	 * Returns the runtime config theme value
	 */
	style.define('defaultTheme', () => THEME);

	/**
	 * Returns included interface themes
	 */
	style.define('includedThemes', () => INCLUDED_THEMES);
};

Object.assign(module.exports, {
	setVar,
	genPath,
	prepareData
});

/**
 * Sets a variable into cssVars dictionary by the specified path
 * @param {string} path
 */
function setVar(path) {
	const
		variable = `--${path.split('.').join('-')}`;

	$C(cssVars).set(`var(${variable})`, path);
	$C(cssVars).set(`var(${variable}-diff)`, `diff.${path}`);

	cssVars.__map__.set(path, [variable, $C(DS).get(path)]);
}

/**
 * Returns path with a dot delimiter between prefix and suffix
 *
 * @param {string} prefix
 * @param {string} suffix
 * @returns {string}
 */
function genPath(prefix, suffix) {
	return `${prefix ? `${prefix}.${suffix}` : suffix}`;
}

/**
 * Converts object prop values to Stylus values
 *
 * @param {Object} data
 * @param {string=} [path]
 */
function prepareData(data, path) {
	$C(data).forEach((d, val) => {
		if (Object.isObject(d)) {
			prepareData(d, genPath(path, val));

		} else if (Object.isArray(d)) {
			prepareData(d, genPath(path, val));
			d = stylus.utils.coerceArray(d, true);

		} else {
			setVar(genPath(path, val));

			if (/^[a-z-_]+\(.*\)$/.test(d)) {
				// Built-in function
				data[val] = new stylus.Parser(d).function();
				return;
			}

			if (/^#(?=[0-9a-fA-F]*$)(?:.{3,4}|.{6}|.{8})$/.test(d)) {
				// HEX value
				data[val] = new stylus.Parser(d).peek().val;
				return;
			}

			if (Object.isString(d)) {
				const
					reg = /(\d+(?:\.\d+)?)(?=(px|em|rem|%)$)/,
					unit = d.match(reg);

				if (unit) {
					// Value with unit
					data[val] = new stylus.nodes.Unit(parseFloat(unit[1]), unit[2]);
					return;
				}

				data[val] = new stylus.nodes.String(d);
				return;
			}

			data[val] = new stylus.nodes.Unit(d);
		}
	});
}
