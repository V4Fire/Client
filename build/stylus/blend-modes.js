'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
	stylus = require('stylus');

const
	{rgba, rgb, red, green, blue, alpha} = stylus.functions;

const blendModes = {
	/**
	 * Color burn blend mode
	 *
	 * @param f {!Object} - foreground color
	 * @param b {!Object} - background color
	 * @returns {Object}
	 */
	colorBurn(f, b) {
		const getColor = ({val: f}, {val: b}) => {
			const
				tmp = 255 - ((255 - b) * 255) / f;

			if (f === 0) {
				f = 255;

			} else if (tmp < 0) {
				f = 0;

			} else {
				f = tmp;
			}

			return new stylus.nodes.Unit(f);
		};

		const
			redColor = getColor(red(f), red(b)),
			greenColor = getColor(green(f), green(b)),
			blueColor = getColor(blue(f), blue(b));

		return blendModes.normal(rgba(redColor, greenColor, blueColor, alpha(f)), b);
	},

	/**
	 * Normal blend mode
	 *
	 * @param {!Object} f - foreground color
	 * @param {!Object} b - background color
	 * @returns {Object}
	 */
	normal(f, b) {
		const
			opacity = alpha(f),
			backOpacity = alpha(b);

		const
			unit = (value) => new stylus.nodes.Unit(value);

		const
			redColor = unit(red(f) * opacity + red(b) * backOpacity * (1 - opacity)),
			greenColor = unit(green(f) * opacity + green(b) * backOpacity * (1 - opacity)),
			blueColor = unit(blue(f) * opacity + blue(b) * backOpacity * (1 - opacity));

		return rgb(redColor, greenColor, blueColor);
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
		if (!foreground.rgba || !background.rgba) {
			throw new Error('Colors didn\'t specified');
		}

		const
			m = mode.string.camelize(false);

		if (!blendModes[m]) {
			throw new Error(`Blend function for mode ${m} didn't registered`);
		}

		if (Object.isFunction(blendModes[m])) {
			return blendModes[m](foreground, background);
		}
	});
};
