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
	{plainDesignSystem, plainWithAbstractColors} = include('build/stylus/ds/test/scheme/plain'),
	{unThemeText} = include('build/stylus/ds/test/scheme/themes'),
	createPlugins = include('build/stylus/ds/plugins'),
	{getCSSVariable} = include('build/stylus/ds/test/helpers'),
	{createDesignSystem} = include('build/stylus/ds/helpers');

describe('build/stylus/plugins/get-ds-field-value', () => {
	it('should return a value from non-themed design system', () => {
		const
			stylus = require('stylus');

		const
			{data: ds, variables: cssVariables} = createDesignSystem(plainDesignSystem),
			plugins = createPlugins({ds, cssVariables, stylus});

		stylus.render('getDSFieldValue(colors "green.0")', {use: [plugins]}, (err, hex) => {
			expect(hex).toEqual(stylus.render(plainDesignSystem.colors.green[0]));
		});
	});

	it('should return a value from themed design system', () => {
		const
			stylus = require('stylus'),
			theme = 'day';

		const
			{data: ds, variables: cssVariables} = createDesignSystem(unThemeText),
			plugins = createPlugins({ds, cssVariables, theme, stylus});

		stylus.render('getDSFieldValue(colors "red.0")', {use: [plugins]}, (err, hex) => {
			expect(hex).toEqual(`${stylus.render(unThemeText.colors.theme[theme].red[0])}`);
		});
	});

	it('should return a value for a themed design system and included variables', () => {
		const
			stylus = require('stylus'),
			theme = 'day';

		const
			{data: ds, variables: cssVariables} = createDesignSystem(unThemeText),
			plugins = createPlugins({ds, cssVariables, theme, stylus, includeThemes: true});

		stylus.render('getDSFieldValue(colors "red.0")', {use: [plugins]}, (err, hex) => {
			expect(hex.trim()).toEqual(`${getCSSVariable('colors.red.0')}`);
		});
	});

	it('should return a value for a themed design system and with includeThemes', () => {
		const
			stylus = require('stylus'),
			theme = 'day';

		const
			{data: ds, variables: cssVariables} = createDesignSystem(unThemeText),
			plugins = createPlugins({ds, cssVariables, theme, stylus, includeThemes: true});

		stylus.render('getDSFieldValue(colors "red.0")', {use: [plugins]}, (err, hex) => {
			expect(hex.trim()).toEqual(`${getCSSVariable('colors.red.0')}`);
		});
	});

	it('should return colors dictionary', () => {
		const
			stylus = require('stylus');

		const
			{data: ds, variables: cssVariables} = createDesignSystem(plainWithAbstractColors),
			plugins = createPlugins({ds, cssVariables, stylus});

		stylus.render(
			'.foo\n\tcontent join(".", keys(getDSFieldValue(colors)))',
			{use: [plugins]},
			(err, colors) => {
				expect(colors.includes(Object.keys(plainWithAbstractColors.colors).join('.'))).toBeTrue();
			}
		);
	});
});
