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
	plainMock = include('build/stylus/ds/test/scheme/ds-plain'),
	{fullThemedMock, unThemeTextMock} = include('build/stylus/ds/test/scheme/ds-themes'),
	createPlugins = include('build/stylus/ds/plugins'),
	{createDesignSystem, createVariableName} = include('build/stylus/ds/helpers'),
	{dsHasThemesNotIncluded} = include('build/stylus/ds/const');

describe('build/stylus/plugins', () => {
	function getCSSVariable(path) {
		return `'var(${createVariableName(path)})'`;
	}

	it('should return a value from getDSFieldValue', () => {
		const
			stylus = require('stylus');

		const
			{data: ds, variables: cssVariables} = createDesignSystem(plainMock),
			plugins = createPlugins({ds, cssVariables, stylus});

		stylus.render('getDSFieldValue(colors "green.0")', {use: [plugins]}, (err, hex) => {
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

	it('should return variables', () => {
		const
			stylus = require('stylus');

		const
			{data: ds, variables: cssVariables} = createDesignSystem(plainMock),
			plugins = createPlugins({ds, cssVariables, stylus});

		stylus.render('getDSVariables()', {use: [plugins]}, (err, value) => {
			expect(value).toBeTruthy();
		});
	});

	it('should return text styles', () => {
		const
			stylus = require('stylus');

		const
			{data: ds, variables: cssVariables} = createDesignSystem(plainMock),
			plugins = createPlugins({ds, cssVariables, stylus});

		stylus.render('getDSTextStyles(Base)', {use: [plugins]}, (err, text) => {
			const
				mock = unThemeTextMock.text['Base'],
				resultObj = JSON.parse(text);

			expect(resultObj.fontFamily).toEqual(`'${mock.fontFamily}'`);
			expect(resultObj.fontWeight).toEqual(`${mock.fontWeight}`);

			expect(resultObj.fontSize).toEqual(mock.fontSize);
			expect(resultObj.lineHeight).toEqual(mock.lineHeight);
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

	it('should return a value from getDSFieldValue for a themed design system', () => {
		const
			stylus = require('stylus'),
			theme = 'day';

		const
			{data: ds, variables: cssVariables} = createDesignSystem(unThemeTextMock),
			plugins = createPlugins({ds, cssVariables, theme, stylus});

		stylus.render('getDSFieldValue(colors "red.0")', {use: [plugins]}, (err, hex) => {
			expect(hex).toEqual(`${stylus.render(unThemeTextMock.colors.theme[theme].red[0])}`);
		});
	});

	it('should return a value from getDSFieldValue for a themed design system and includeVars', () => {
		const
			stylus = require('stylus'),
			theme = 'day';

		const
			{data: ds, variables: cssVariables} = createDesignSystem(unThemeTextMock),
			plugins = createPlugins({ds, cssVariables, theme, stylus, includeThemes: true});

		stylus.render('getDSFieldValue(colors "red.0")', {use: [plugins]}, (err, hex) => {
			expect(hex.trim()).toEqual(`${getCSSVariable('colors.red.0')}`);
		});
	});

	it('should return a value from getDSFieldValue for a themed design system and includeThemes', () => {
		const
			stylus = require('stylus'),
			theme = 'day';

		const
			{data: ds, variables: cssVariables} = createDesignSystem(unThemeTextMock),
			plugins = createPlugins({ds, cssVariables, theme, stylus, includeThemes: true});

		stylus.render('getDSFieldValue(colors "red.0")', {use: [plugins]}, (err, hex) => {
			expect(hex.trim()).toEqual(`${getCSSVariable('colors.red.0')}`);
		});
	});

	it('should return a variables dict from getDSTextStyles for a themed design system', () => {
		const
			stylus = require('stylus'),
			theme = 'day';

		const
			{data: ds, variables: cssVariables} = createDesignSystem(fullThemedMock),
			plugins = createPlugins({ds, cssVariables, theme, includeThemes: ['day', 'night'], stylus});

		stylus.render('getDSTextStyles("Heading1")', {use: [plugins]}, (err, text) => {
			const
				mock = unThemeTextMock.text.Heading1,
				resultObj = JSON.parse(text);

			Object.keys(mock).forEach((key) => {
				expect(resultObj[key]).toEqual(`${getCSSVariable(`text.Heading1.${key}`)}`);
			});
		});
	});

	it('should return a value from getDSTextStyles for a themed design system and a non themed field', () => {
		const
			stylus = require('stylus'),
			theme = 'day';

		const
			{data: ds, variables: cssVariables} = createDesignSystem(unThemeTextMock),
			plugins = createPlugins({ds, cssVariables, theme, stylus});

		stylus.render('getDSTextStyles("Heading-3")', {use: [plugins]}, (err, text) => {
			const
				mock = unThemeTextMock.text['Heading-3'],
				resultObj = JSON.parse(text);

			expect(resultObj.fontFamily).toEqual(`'${mock.fontFamily}'`);
			expect(resultObj.fontWeight).toEqual(`${mock.fontWeight}`);

			expect(resultObj.fontSize).toEqual(mock.fontSize);
			expect(resultObj.lineHeight).toEqual(mock.lineHeight);
		});
	});

	it('should return css variables from plugins with an including vars flag', () => {
		const
			stylus = require('stylus');

		const
			{data: ds, variables: cssVariables} = createDesignSystem(plainMock),
			plugins = createPlugins({ds, cssVariables, stylus, includeVars: true});

		stylus.render('getDSColor("orange", 1)', {use: [plugins]}, (err, hex) => {
			expect(hex.trim()).toEqual(`${getCSSVariable('colors.orange.0')}`);
		});

		stylus.render('getDSTextStyles(Small)', {use: [plugins]}, (err, text) => {
			const
				resultObj = JSON.parse(text);

			Object.keys(plainMock.text.Small).forEach((key) => {
				expect(resultObj[key]).toEqual(`${getCSSVariable(`text.Small.${key}`)}`);
			});
		});

		stylus.render('getDSFieldValue(rounding small)', {use: [plugins]}, (err, value) => {
			expect(value.trim()).toEqual(`${getCSSVariable('rounding.small')}`);
		});

		stylus.render('getDSFieldValue("colors" "blue.1")', {use: [plugins]}, (err, hex) => {
			expect(hex.trim()).toEqual(`${getCSSVariable('colors.blue.1')}`);
		});
	});
});
