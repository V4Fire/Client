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
	getPlugins = include('build/stylus/ds/plugins');

const
	{plainDesignSystem, plainWithAbstractColors} = include('build/stylus/ds/test/scheme/plain'),
	{unThemeText} = include('build/stylus/ds/test/scheme/themes'),
	{getCSSVariable} = include('build/stylus/ds/test/helpers'),
	{createDesignSystem} = include('build/stylus/ds/helpers');

describe('build/stylus/plugins/get-ds-field-value', () => {
	it('should returns a value from the non-themed design system', () => {
		const
			stylus = require('stylus');

		const
			{data: ds, variables: cssVariables} = createDesignSystem(plainDesignSystem),
			plugins = getPlugins({ds, cssVariables, stylus});

		stylus.render('getDSValue(colors "green.0")', {use: [plugins]}, (err, hex) => {
			expect(hex).toEqual(stylus.render(plainDesignSystem.colors.green[0]));
		});
	});

	it('should returns a value from the themed design system', () => {
		const
			stylus = require('stylus'),
			theme = 'day';

		const
			{data: ds, variables: cssVariables} = createDesignSystem(unThemeText),
			plugins = getPlugins({ds, cssVariables, theme, stylus});

		stylus.render('getDSValue(colors "red.0")', {use: [plugins]}, (err, hex) => {
			expect(hex).toEqual(`${stylus.render(unThemeText.colors.theme[theme].red[0])}`);
		});
	});

	it('should returns a value for the themed design system and included variables', () => {
		const
			stylus = require('stylus'),
			theme = 'day';

		const
			{data: ds, variables: cssVariables} = createDesignSystem(unThemeText),
			plugins = getPlugins({ds, cssVariables, theme, stylus, includeThemes: true});

		stylus.render('getDSValue(colors "red.0")', {use: [plugins]}, (err, hex) => {
			expect(hex.trim()).toEqual(`${getCSSVariable('colors.red.0')}`);
		});
	});

	it('should returns a value for the themed design system and with includeThemes', () => {
		const
			stylus = require('stylus'),
			theme = 'day';

		const
			{data: ds, variables: cssVariables} = createDesignSystem(unThemeText),
			plugins = getPlugins({ds, cssVariables, theme, stylus, includeThemes: true});

		stylus.render('getDSValue(colors "red.0")', {use: [plugins]}, (err, hex) => {
			expect(hex.trim()).toEqual(`${getCSSVariable('colors.red.0')}`);
		});
	});

	it('should returns a dictionary with colors', () => {
		const
			stylus = require('stylus');

		const
			{data: ds, variables: cssVariables} = createDesignSystem(plainWithAbstractColors),
			plugins = getPlugins({ds, cssVariables, stylus});

		stylus.render(
			'.foo { content: join(".", keys(getDSValue(colors))) }',
			{use: [plugins]},
			(err, colors) => {
				expect(colors.includes(Object.keys(plainWithAbstractColors.colors).join('.'))).toBeTrue();
			}
		);
	});
});
