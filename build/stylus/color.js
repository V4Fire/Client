'use strict';

const
	$C = require('collection.js'),
	stylus = require('stylus'),
	pzlr = require('@pzlr/build-core');

const
	GLOBAL = {
		colors: {}
	};

/**
 * Converts stylus nodes collection to js array
 * @param nodes
 */
function kitFromNodes(nodes) {
	const
		str = nodes.toString().replace(/[ ()]/g, '');

	return str.split(',');
}

/**
 * Saves subset of colors
 * to global color sets variable
 *
 * @param kit - subset
 * @param {?} el - name of a subset
 */
function saveColorsKit(kit, el) {
	const
		reduce = (s) => $C(s).reduce((res, el, name) => {
			if (el.nodes) {
				res[name] = [].concat([[]], kitFromNodes(el.nodes));
			}
			return res;
		}, {});

	if (el) {
		GLOBAL.colors[el] = reduce(kit);

	} else {
		const
			res = reduce(kit);

		$C(GLOBAL.colors).forEach((el, key) => {
			if (Array.isArray(el[0]) && res[key]) {
				res[key][0] = el[0]
			}
		});

		GLOBAL.colors = res;
	}
}

/**
 * Picks rgba color from hex string
 * @param el - hex value
 */
function pickColor(el) {
	return new stylus.Parser(el).peek().val
}

module.exports = function (style) {
	/**
	 * Sets the child colors kit
	 * with kits of parent projects
	 *
	 * @param par - parent kit
	 * @param ch - child kit
	 */
	style.define('inheritColors', (par, ch) => {
		const
			{dependencies} = pzlr.config,
			parent = par.vals,
			child = ch.vals;

		saveColorsKit(child);
		$C(dependencies).forEach((el, i) => {
			if (i == 0) {
				saveColorsKit(parent, el);

			} else if (parent[el]){
				saveColorsKit(parent[el], el);
			}
		});
	});

	/**
	 * Sets a color theme kit for proto or global colors
	 *
	 * @param kit - themed kit
	 * @param {?} proto - proto name
	 */
	style.define('setReservedColorKits', (kit, proto) => {
		$C(kit.vals).forEach((el, key) => {
			const
				base = proto ? GLOBAL.colors[proto.val] : GLOBAL.colors;

			if (!base) {
				throw new Error(`Field with name ${proto} not found`)
			}

			if (!base[key]) {
				base[key] = [[]];
			}

			base[key][0] = kitFromNodes(el.nodes);
		});
	});

	/**
	 * Sets global colors kit
	 * @param kit
	 */
	style.define('setGlobalColors', (kit) => {
		saveColorsKit(kit);
	});

	/**
	 * Returns global color value
	 *
	 * @param hueInput - color name
	 * @param numInput - color position in a kit
	 * @param reservedInput - is value in reserved kit
	 * @param proto - proto field name
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
			if (col && (reserved && col[0][num] || col[num])) {
				return reserved ? pickColor(col[0][num]) : pickColor(col[num]);
			}

			$C(dependencies).some((el) => {
				col = GLOBAL.colors[el];

				if (col) {
					if (reserved && col[hue][0][num]) {
						res = col[hue][0][num];
						return true;

					} else if (!reserved && col[hue][num]) {
						res = col[hue][num];
						return true;
					}
				}
			})

		} else {
			const
				kit = GLOBAL.colors[base];

			if (kit && reserved) {
				res = kit[hue][0][num]

			} else if (kit && kit[hue] && kit[hue][num]) {
				res = kit[hue][num];
			}
		}

		return pickColor(res);
	});
};
