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
	{cssVars} = include('build/stylus/ds/const');

Object.defineProperty(cssVars, '__map__', {
	enumerable: false,
	value: {}
});

/**
 * Sets a variable into cssVars dictionary by the specified path
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

	$C(cssVars).set(`var(${variable})`, path);

	if (theme === undefined) {
		cssVars.__map__[path] = mapValue;

	} else {
		if (!cssVars.__map__[theme]) {
			Object.defineProperty(cssVars.__map__, theme, {value: {}, enumerable: false});
		}

		cssVars.__map__[theme][path] = mapValue;
	}
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
				// Stylus built-in function
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

module.exports = {
	setVar,
	prepareData,
	genPath
};
