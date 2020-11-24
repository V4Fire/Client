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
	{fullThemed} = include('build/stylus/ds/test/scheme/themes'),
	createPlugins = include('build/stylus/ds/plugins'),
	{getCSSVariable} = include('build/stylus/ds/test/helpers'),
	{createDesignSystem} = include('build/stylus/ds/helpers'),
	{dsHasThemesNotIncluded} = include('build/stylus/ds/const');

describe('build/stylus/plugins', () => {
	it('throws an error on creating plugins for a package with themes without specifying a theme', () => {
		const
			stylus = require('stylus'),
			{data: ds, variables: cssVariables} = createDesignSystem(fullThemed);

		expect(() => createPlugins({ds, cssVariables, stylus})).toThrowError(dsHasThemesNotIncluded);
	});

	it('should return css variables from plugins with an including vars flag', () => {
		const
			stylus = require('stylus');

		const
			{data: ds, variables: cssVariables} = createDesignSystem(plainDesignSystem),
			plugins = createPlugins({ds, cssVariables, stylus, includeVars: true});

		stylus.render('getDSColor("orange", 1)', {use: [plugins]}, (err, hex) => {
			expect(hex.trim()).toEqual(`${getCSSVariable('colors.orange.0')}`);
		});

		stylus.render('getDSTextStyles(Small)', {use: [plugins]}, (err, text) => {
			const
				resultObj = JSON.parse(text);

			Object.keys(plainDesignSystem.text.Small).forEach((key) => {
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
