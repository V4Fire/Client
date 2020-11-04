'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

require('config');

const
	plainMock = include('build/stylus/ds/test/mocks/ds-plain'),
	{fullThemedMock} = include('build/stylus/ds/test/mocks/ds-themes'),
	createPlugins = include('build/stylus/ds/plugins'),
	{createDesignSystem} = include('build/stylus/ds/helpers'),
	{dsHasThemesNotIncluded} = include('build/stylus/ds/const');

describe('build/stylus/plugins', () => {
	it('should return a value from getDSOptions', () => {
		const
			stylus = require('stylus');

		const
			{data: ds, variables: cssVariables} = createDesignSystem(plainMock),
			plugins = createPlugins({ds, cssVariables, stylus});

		stylus.render('getDSOptions("colors", "green.0")', {use: [plugins]}, (err, hex) => {
			expect(hex).toEqual(stylus.render(plainMock.colors.green[0]));
		});
	});

	it('should return a value from getDSColor', () => {
		const
			stylus = require('stylus');

		const
			{data: ds, variables: cssVariables} = createDesignSystem(plainMock),
			plugins = createPlugins({ds, cssVariables, stylus});

		stylus.render('getDSColor("blue", 1)', {use: [plugins]}, (err, hex) => {
			expect(hex).toEqual(stylus.render(plainMock.colors.blue[0]));
		});
	});

	it('should return a value from getDSVariables', () => {
		const
			stylus = require('stylus');

		const
			{data: ds, variables: cssVariables} = createDesignSystem(plainMock),
			plugins = createPlugins({ds, cssVariables, stylus});

		stylus.render('getDSVariables()', {use: [plugins]}, (err, value) => {
			expect(value).toBeTruthy();
		});
	});

	it('should return a value from getDSTextStyles', () => {
		const
			stylus = require('stylus');

		const
			{data: ds, variables: cssVariables} = createDesignSystem(plainMock),
			plugins = createPlugins({ds, cssVariables, stylus});

		stylus.render('getDSTextStyles(Base)', {use: [plugins]}, (err, value) => {
			expect(value).toBeTruthy();
		});
	});

	it('should return a build theme from defaultTheme', () => {
		const
			stylus = require('stylus'),
			theme = 'day';

		const
			{data: ds, variables: cssVariables} = createDesignSystem(plainMock),
			plugins = createPlugins({ds, cssVariables, theme, stylus});

		stylus.render('defaultTheme()', {use: [plugins]}, (err, value) => {
			expect(value.trim()).toEqual(`'${theme}'`);
		});
	});

	it('throws an error on creating plugins for a package with themes without specifying a theme', () => {
		const
			stylus = require('stylus'),
			{data: ds, variables: cssVariables} = createDesignSystem(fullThemedMock);

		expect(() => createPlugins({ds, cssVariables, stylus})).toThrowError(dsHasThemesNotIncluded);
	});
});
