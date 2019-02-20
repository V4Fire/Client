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

const GLOBAL = {
	kits: {},
	space: {}
};

/**
 * Saves HEXs to the global space with its kit names
 *
 * @param {!Array} colors
 * @param {!string} name
 */
function saveToSpace(colors, name) {
	$C(colors).forEach((el) => {
		GLOBAL.space[el] = name;
	});
}

/**
 * Throws an error if a color
 * already exists in the global space
 *
 * @param {!RGBA} hex
 * @returns {RGBA}
 */
function checkInGlobalSpace(hex) {
	const
		color = hex.raw || hex.string || hex.name;

	if (GLOBAL.space[color]) {
		throw new Error(`Identical HEX was found at the kit with name '${GLOBAL.space[color]}'`);
	}

	return hex;
}

/**
 * Converts stylus nodes collection to a js array
 *
 * @param {!Object} nodes
 * @param {string} name
 * @returns {string[]}
 */
function kitFromNodes(nodes, name) {
	const
		str = nodes.toString().replace(/[ ()]/g, ''),
		values = str.split(',');

	saveToSpace(values, name);
	return values;
}

/**
 * Saves subset of colors to a global color sets variable
 *
 * @param {!Object} kit - subset
 * @param {string} nm - name of a subset
 */
function saveColorsKit(kit, nm) {
	const reduce = (s) => $C(s).reduce((res, el, name) => {
		if (el.nodes) {
			res[name] = [].concat([[]], kitFromNodes(el.nodes, name));
		}

		return res;
	}, {});

	if (nm) {
		GLOBAL.kits[nm] = reduce(kit);

	} else {
		const
			res = reduce(kit);

		$C(GLOBAL.kits).forEach((el, key) => {
			if (Array.isArray(el[0]) && res[key]) {
				res[key][0] = el[0];
			}
		});

		GLOBAL.kits = res;
	}
}

/**
 * Picks an rgba color from the specified hex string
 *
 * @param {string} str - hex value
 * @param {Object=} [meta] - additional info
 * @returns {string}
 */
function pickColor(str, meta = {}) {
	try {
		return new stylus.Parser(str).peek().val;

	} catch {
		throw new Error(`Can't find a color with the hex value ${str}. Additional info ${JSON.stringify(meta)}`);
	}
}

module.exports = function (style) {
	/**
	 * Sets the child colors kit with kits of parent projects
	 *
	 * @param {!Object} parent - parent kit
	 * @param {!Object} children - child kit
	 */
	style.define('inheritColors', (parent, children) => {
		parent = parent.vals;
		children = children.vals;
		saveColorsKit(children);

		$C(pzlr.config.dependencies).forEach((el, i) => {
			if (i === 0) {
				saveColorsKit(parent, el);

			} else if (parent[el]) {
				saveColorsKit(parent[el], el);
			}
		});
	});

	/**
	 * Sets a color theme kit for proto or global colors
	 *
	 * @param {!Object} kit - themed kit
	 * @param {!Object} proto - proto name
	 */
	style.define('setReservedColorKits', (kit, proto) => {
		$C(kit.vals).forEach((el, key) => {
			const
				base = proto ? GLOBAL.kits[proto.val] : GLOBAL.kits;

			if (!base) {
				throw new Error(`Field with name ${proto} not found`);
			}

			if (!base[key]) {
				base[key] = [[]];
			}

			base[key][0] = kitFromNodes(el.nodes, key);
		});
	});

	/**
	 * Sets a global colors kit
	 * @param {!Object} kit
	 */
	style.define('setGlobalColors', (kit) => {
		saveColorsKit(kit);
	});

	/**
	 * Returns a global color value
	 *
	 * @param {!Object} hueInput - color
	 * @param {!Object} numInput - color position in a kit
	 * @param {(!Object|boolean)} reservedInput - is value in reserved kit
	 * @param (!Object|boolean) baseInput - proto field name
	 * @returns {string}
	 */
	style.define('getGlobalColor', (hueInput, numInput, reservedInput = false, baseInput = false) => {
		if (arguments.length === 1 && hueInput.raw) {
			return checkInGlobalSpace(hueInput);
		}

		const
			{dependencies} = pzlr.config,
			hue = hueInput.string || hueInput.name,
			num = numInput.string || numInput.val,
			reserved = reservedInput && reservedInput.val || false,
			base = baseInput && baseInput.val || false,
			meta = {hue, num, reserved, base};

		let
			col = GLOBAL.kits[hue],
			res;

		if (!base) {
			if (col && (reserved && col[0][num - 1] || col[num])) {
				return reserved ? pickColor(col[0][num - 1], meta) : pickColor(col[num], meta);
			}

			$C(dependencies).some((el) => {
				col = GLOBAL.kits[el];

				if (col) {
					if (reserved && col[hue][0][num - 1]) {
						res = col[hue][0][num - 1];
						return true;

					} else if (!reserved && col[hue][num]) {
						res = col[hue][num];
						return true;
					}
				}
			});

		} else {
			const
				kit = GLOBAL.kits[base];

			if (kit && reserved) {
				res = kit[hue][0][num - 1];

			} else if (kit && kit[hue] && kit[hue][num]) {
				res = kit[hue][num];
			}
		}

		return pickColor(res, meta);
	});
};
