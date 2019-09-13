'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
	{utils, nodes} = require('stylus');

const blendModes = {
	/**
	 * Blend mode: color burn
	 *
	 * @param f {!Object} - foreground color
	 * @param b {!Object} - background color
	 * @returns {!Object}
	 */
	colorBurn(f, b) {
		const getColor = (f, b) => {
			const
				tmp = 255 - ((255 - b) * 255) / f;

			if (f === 0) {
				f = 255;

			} else if (tmp < 0) {
				f = 0;

			} else {
				f = tmp;
			}

			return f;
		};

		const
			red = getColor(f.r, b.r),
			green = getColor(f.g, b.g),
			blue = getColor(f.b, b.b);

		return blendModes.normal(new nodes.RGBA(red, green, blue, f.a), b);
	},

	/**
	 * Normal blend mode
	 *
	 * @param {!Object} f - foreground color
	 * @param {!Object} b - background color
	 * @returns {!Object}
	 */
	normal(f, b) {
		const
			red = f.r * f.a + b.r * b.a * (1 - f.a),
			green = f.g * f.a + b.g * b.a * (1 - f.a),
			blue = f.b * f.a + b.b * b.a * (1 - f.a);

		return new nodes.RGBA(red, green, blue, 1);
	}
};

module.exports = function (style) {
	/**
	 * Returns a color, mixed with the specified mode
	 *
	 * @param {!Object} foreground
	 * @param {!Object} background
	 * @param {string=} [mode=normal]
	 *
	 * @returns {!Object}
	 * @see https://en.wikipedia.org/wiki/Blend_modes
	 */
	style.define('blend', (foreground, background, mode = 'normal') => {
		utils.assertColor(foreground);
		foreground = foreground.rgba;

		background = background || new nodes.RGBA(255, 255, 255, 1);
		utils.assertColor(background);
		background = background.rgba;

		const
			m = mode.string.camelize(false);

		if (!blendModes[m]) {
			throw new Error(`Blend function for mode ${m} is not registered`);
		}

		if (Object.isFunction(blendModes[m])) {
			return blendModes[m](foreground, background);
		}
	});
};
