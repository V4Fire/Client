/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

'use strict';

require('@config/config');

const
	getPlugins = include('build/stylus/ds/plugins');

const
	{plainDesignSystem} = include('build/stylus/ds/test/scheme/plain'),
	{fullThemed} = include('build/stylus/ds/test/scheme/themes'),
	{getCSSVariable} = include('build/stylus/ds/test/helpers'),
	{createDesignSystem} = include('build/stylus/ds/helpers'),
	{dsHasThemesNotIncluded} = include('build/stylus/ds/const');

describe('build/stylus/plugins', () => {
	it('throws an error on creating plugins for a package with themes without specifying the current theme', () => {
		const
			stylus = require('stylus'),
			{data: ds, variables: cssVariables} = createDesignSystem(fullThemed);

		expect(() => getPlugins({ds, cssVariables, stylus})).toThrowError(dsHasThemesNotIncluded);
	});

	it('should returns CSS variables from plugins with an including vars flag', () => {
		const
			stylus = require('stylus');

		const
			{data: ds, variables: cssVariables} = createDesignSystem(plainDesignSystem),
			plugins = getPlugins({ds, cssVariables, stylus, useCSSVarsInRuntime: true});

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

		stylus.render('getDSValue(rounding small)', {use: [plugins]}, (err, value) => {
			expect(value.trim()).toEqual(`${getCSSVariable('rounding.small')}`);
		});

		stylus.render('getDSValue("colors" "blue.1")', {use: [plugins]}, (err, hex) => {
			expect(hex.trim()).toEqual(`${getCSSVariable('colors.blue.1')}`);
		});
	});
});
