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
	colors: {}
};

/**
 * Converts stylus nodes collection to a js array
 *
 * @param {!Object} nodes
 * @returns {!Array<string>}
 */
function kitFromNodes(nodes) {
	const str = nodes.toString().replace(/[ ()]/g, '');
	return str.split(',');
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
			res[name] = [].concat([[]], kitFromNodes(el.nodes));
		}
		return res;
	}, {});

	if (nm) {
		GLOBAL.colors[nm] = reduce(kit);

	} else {
		const
			res = reduce(kit);

		$C(GLOBAL.colors).forEach((el, key) => {
			if (Array.isArray(el[0]) && res[key]) {
				res[key][0] = el[0];
			}
		});

		GLOBAL.colors = res;
	}
}

/**
 * Picks an rgba color from the specified hex string
 *
 * @param {string} str - hex value
 * @returns {string}
 */
function pickColor(str) {
	return new stylus.Parser(str).peek().val;
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
				base = proto ? GLOBAL.colors[proto.val] : GLOBAL.colors;

			if (!base) {
				throw new Error(`Field with name ${proto} not found`);
			}

			if (!base[key]) {
				base[key] = [[]];
			}

			base[key][0] = kitFromNodes(el.nodes);
		});
	});

	/**
	 * Sets a global colors kit
	 * @param kit
	 */
	style.define('setGlobalColors', (kit) => {
		saveColorsKit(kit);
	});

	/**
	 * Returns a global color value
	 *
	 * @param {!Object} hueInput - color name
	 * @param {!Object} numInput - color position in a kit
	 * @param {(!Object|boolean)} reservedInput - is value in reserved kit
	 * @param (!Object|boolean) baseInput - proto field name
	 * @returns {string}
	 */
	style.define('getGlobalColor', (hueInput, numInput, reservedInput = false, baseInput = false) => {
		const
			{dependencies} = pzlr.config,
			hue = hueInput.string || hueInput.name,
			num = numInput.string || numInput.val,
			reserved = reservedInput && reservedInput.val || false,
			base = baseInput && baseInput.val || false;

		let
			col = GLOBAL.colors[hue],
			res;

		if (!base) {
			if (col && (reserved && col[0][num - 1] || col[num])) {
				return reserved ? pickColor(col[0][num - 1]) : pickColor(col[num]);
			}

			$C(dependencies).some((el) => {
				col = GLOBAL.colors[el];

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
				kit = GLOBAL.colors[base];

			if (kit && reserved) {
				res = kit[hue][0][num - 1];

			} else if (kit && kit[hue] && kit[hue][num]) {
				res = kit[hue][num];
			}
		}

		return pickColor(res);
	});
};
