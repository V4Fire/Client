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
	path = require('upath'),
	fs = require('fs');

const
	{src} = require('config'),
	{config} = require('@pzlr/build-core');

let
	DS = {};

const cssVars = {
	__map__: new Map()
};

if (config.designSystem) {
	try {
		DS = require(config.designSystem);

	} catch {
		console.log(`[stylus] Can't find "${config.designSystem}" design system package`);
	}

} else {
	console.log('[stylus] Design system package is not specified');
}

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

prepareData(DS);

module.exports = function (style) {
	/**
	 * Injects additional options to component options ($p)
	 *
	 * @param {string} string - component name
	 * @returns {!Object}
	 */
	style.define(
		'injector',
		({string}) => {
			const
				value = $C(DS).get(`components.${string}`);

			if (value) {
				const
					__vars__ = $C(cssVars).get(`components.${string}`),
					__diffVars__ = $C(cssVars).get(`diff.components.${string}`);

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
	 * Returns Design System css variables with values
	 * @returns {!Object}
	 */
	style.define('getFlatDSVars', () => {
		const
			obj = {};

		// eslint-disable-next-line no-unused-vars
		for (const val of cssVars.__map__.values()) {
			const
				[key, value] = val;

			if (value || Object.isNumber(value)) {
				obj[key] = stylus.utils.parseString(value);
			}
		}

		return stylus.utils.coerce(obj, true);
	});

	/**
	 * Returns a part of the Design System by the specified path or whole DS object
	 *
	 * @param {string} string - field path
	 * @param {boolean=} [vars] - if true, the method will return css variables from the specified path
	 * @returns {!Object}
	 */
	style.define(
		'getDSOptions',
		({string}, vars = false) => {
			if (vars && vars.val) {
				return string ? stylus.utils.coerce($C(cssVars).get(string), true) : {};
			}

			return string ? stylus.utils.coerce($C(DS).get(string), true) || {} : DS;
		}
	);

	/**
	 * Returns color(s) from the Design System by the specified name and identifier (optional)
	 *
	 * @param {!Object} hueInput
	 * @param {!Object} [hueNum]
	 * @returns {(!Object|!Array)}
	 */
	style.define(
		'getDSColor',
		(hueInput, hueId) => {
			const
				hue = hueInput.string || hueInput.name;

			let
				id;

			if (hueId) {
				id = hueId.string || hueId.val;

				if (Object.isNumber(id)) {
					id = id - 1;
				}
			}

			return hue ? $C(DS).get(`colors.${hue}${id !== undefined ? `.${id}` : ''}`) : undefined;
		}
	);

	/**
	 * Returns an icon CSS string by the specified name
	 *
	 * @param {string} string - icon name
	 * @returns {!Object}
	 */
	style.define(
		'getDSIcon',
		({string}) => {
			const
				filePath = path.join(src.cwd(), 'node_modules', config.designSystem, 'icons', `${string}.svg`);

			const
				svgContent = fs.readFileSync(filePath, 'utf8'),
				svgCssString = encodeURIComponent(svgContent.replace(/\n/gm, ''));

			return stylus.utils.coerce(`data:image/svg+xml,${svgCssString}`);
		}
	);
};
