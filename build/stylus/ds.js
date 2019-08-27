const
	$C = require('collection.js'),
	stylus = require('stylus');

const
	{config} = require('@pzlr/build-core');

let
	DS = {};

const
	cssVars = {
		__map__: new Map()
	};

if (config.designSystem) {
	DS = require(config.designSystem);

} else {
	console.log('[stylus] Design system package is not specified');
}

/**
 * Sets var into cssVars dictionary by the specified path
 * @param path
 */
function setVar(path) {
	const
		variable = `--${path.split('.').join('-')}`;

	$C(cssVars).set(stylus.utils.parseString(`var(${variable})`), path);
	cssVars.__map__.set(path, [variable, $C(DS).get(path)]);
}

/**
 * Return path with dot delimiter between prefix and suffix
 *
 * @param prefix
 * @param suffix
 * @return {string}
 */
function genPath(prefix, suffix) {
	return `${prefix ? `${prefix}.${suffix}` : suffix}`;
}

/**
 * Converts object props values to values in Stylus types
 *
 * @param data
 * @param [path]
 */
function prepareData(data, path) {
	$C(data).forEach((d, val) => {
		if (Object.isObject(d) || Object.isArray(d)) {
			prepareData(d, genPath(path, val));

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
	 * Injects additional options to a block options dict ($p)
	 *
	 * @param {string} string - component name
	 * @returns {!Object}
	 */
	style.define(
		'injector',
		({string}) => {
			const
				__vars__ = $C(cssVars).get(`components.${string}`),
				value = $C(DS).get(`components.${string}`);

			if (value) {
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
	 * Returns part of the Design System
	 * by the specified path or whole DS object
	 *
	 * @param {string} string - field path
	 * @param {boolean} [vars=false] - if true, method will return css vars for the specified path
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
	 * Returns color(s) from the Design System
	 * by the specified name and identifier (optional)
	 *
	 * @param {!Object} hueInput
	 * @param {!Object} [hueNum]
	 * @returns {!Object|Array}
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
};
