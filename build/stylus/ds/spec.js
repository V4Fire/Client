'use strict';

/*!
 * V4Fire Core
 * https://github.com/V4Fire/Core
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Core/blob/master/LICENSE
 */

const
	pzlr = require('@pzlr/build-core'),
	stylus = require('stylus');

const
	plugins = require('../ds');

describe('build/stylus/ds', () => {
	it('should return first green hue from the project design system', () => {
		const
			ds = require(pzlr.config.designSystem);

		stylus.render('getDSOptions("colors.green.0")', {use: [plugins]}, (err, hex) => {
			expect(hex).toEqual(stylus.render(ds.colors.green[0]));
		});
	});
});
