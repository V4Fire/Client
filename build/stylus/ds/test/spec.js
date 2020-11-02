'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
	config = require('config'),
	stylus = require('stylus');

const
	plainMock = include('build/stylus/ds/test/mocks/ds-plain'),
	createPlugins = include('build/stylus/ds/plugins'),
	{createDesignSystem} = include('build/stylus/ds/helpers');

describe('build/stylus/ds', () => {
	it('should return values from the project design system', () => {
		const
			{theme, includeThemes} = config.runtime(),
			themedFields = config.themedFields();

		const
			{data: ds, variables: cssVariables} = createDesignSystem(plainMock),
			plugins = createPlugins({ds, cssVariables, theme, includeThemes, themedFields});

		stylus.render('getDSOptions("colors", "green.0")', {use: [plugins]}, (err, hex) => {
			console.log(42, err, hex);
			expect(hex).toEqual(stylus.render(plainMock.colors.green[0]));
		});
	});
});
