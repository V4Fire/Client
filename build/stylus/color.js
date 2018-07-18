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
 * to global colors sets variable
 *
 * @param set - subset
 * @param {?} el - name of a subset
 */
function saveColorsSet(set, el) {
	const
		reduce = (s) => $C(s).reduce((res, el, name) => {
			if (el.nodes) {
				res[name] = [].concat([[]], kitFromNodes(el.nodes));
			}
			return res;
		}, {});

	if (el) {
		GLOBAL.colors[el] = reduce(set);

	} else {
		const
			res = reduce(set);

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

		saveColorsSet(child);
		$C(dependencies).forEach((el, i) => {
			if (i == 0) {
				saveColorsSet(parent, el);

			} else if (parent[el]){
				saveColorsSet(parent[el], el);
			}
		});
	});

	/**
	 * Sets a color theme kit for proto or global colors
	 *
	 * @param set - theme kit
	 * @param {?} proto - proto name
	 */
	style.define('setReservedColorKits', (set, proto) => {
		$C(set.vals).forEach((el, key) => {
			let color;

			const
				base = proto ? GLOBAL.colors[proto.val] : GLOBAL.colors

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
			if (col && (col[0][num] || col[num])) {
				return reserved && col[0][num] ? pickColor(col[0][num]) : pickColor(col[num]);
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
			const set = GLOBAL.colors[base];

			if (set && reserved) {
				res = set[hue][0][num]

			} else if (set && set[hue] && set[hue][num]) {
				res = set[hue][num];
			}
		}

		return pickColor(res);
	});
};
