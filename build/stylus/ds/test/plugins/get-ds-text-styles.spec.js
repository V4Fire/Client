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
	{plainDesignSystem} = include('build/stylus/ds/test/scheme/plain'),
	{unThemeText} = include('build/stylus/ds/test/scheme/themes'),
	{fullThemed} = include('build/stylus/ds/test/scheme/themes'),
	createPlugins = include('build/stylus/ds/plugins'),
	{getCSSVariable} = include('build/stylus/ds/test/helpers'),
	{createDesignSystem} = include('build/stylus/ds/helpers');

describe('build/stylus/plugins/get-ds-variables', () => {
	it('should return text styles', () => {
		const
			stylus = require('stylus');

		const
			{data: ds, variables: cssVariables} = createDesignSystem(plainDesignSystem),
			plugins = createPlugins({ds, cssVariables, stylus});

		stylus.render('getDSTextStyles(Base)', {use: [plugins]}, (err, text) => {
			const
				mock = unThemeText.text['Base'],
				resultObj = JSON.parse(text);

			expect(resultObj.fontFamily).toEqual(`'${mock.fontFamily}'`);
			expect(resultObj.fontWeight).toEqual(`${mock.fontWeight}`);

			expect(resultObj.fontSize).toEqual(mock.fontSize);
			expect(resultObj.lineHeight).toEqual(mock.lineHeight);
		});
	});

	it('should return a variables dict for a themed design system', () => {
		const
			stylus = require('stylus'),
			theme = 'day';

		const
			{data: ds, variables: cssVariables} = createDesignSystem(fullThemed),
			plugins = createPlugins({ds, cssVariables, theme, includeThemes: ['day', 'night'], stylus});

		stylus.render('getDSTextStyles("Heading1")', {use: [plugins]}, (err, text) => {
			const
				mock = unThemeText.text.Heading1,
				resultObj = JSON.parse(text);

			Object.keys(mock).forEach((key) => {
				expect(resultObj[key]).toEqual(`${getCSSVariable(`text.Heading1.${key}`)}`);
			});
		});
	});

	it('should return a value for a themed design system and a non themed field', () => {
		const
			stylus = require('stylus'),
			theme = 'day';

		const
			{data: ds, variables: cssVariables} = createDesignSystem(unThemeText),
			plugins = createPlugins({ds, cssVariables, theme, stylus});

		stylus.render('getDSTextStyles("Heading-3")', {use: [plugins]}, (err, text) => {
			const
				mock = unThemeText.text['Heading-3'],
				resultObj = JSON.parse(text);

			expect(resultObj.fontFamily).toEqual(`'${mock.fontFamily}'`);
			expect(resultObj.fontWeight).toEqual(`${mock.fontWeight}`);

			expect(resultObj.fontSize).toEqual(mock.fontSize);
			expect(resultObj.lineHeight).toEqual(mock.lineHeight);
		});
	});
});

