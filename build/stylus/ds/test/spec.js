'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
	config = require('config');

const
	plainMock = include('build/stylus/ds/test/mocks/ds-plain'),
	createPlugins = include('build/stylus/ds/plugins'),
	{createDesignSystem} = include('build/stylus/ds/helpers');

describe('build/stylus/ds', () => {
	it('should create plain design system', () => {
		const
			stylus = require('stylus'),
			{data: designSystem} = createDesignSystem(plainMock);

		expect(Object.isObject(designSystem.colors)).toBeTrue();

		const
			{colors} = designSystem;

		Object.keys(colors).forEach((key) => {
			expect(Object.isArray(colors[key])).toBeTrue();

			colors[key].forEach((c) => {
				expect(['expression', 'rgba']).toContain(stylus.functions.type(c));
			});
		});

		const
			{text} = designSystem;

		expect(Object.isObject(text)).toBeTrue();
		expect(Object.keys(text).length).toBe(Object.keys(plainMock.text).length);

		Object.keys(text).forEach((key) => {
			const
				style = text[key];

			expect(Object.isObject(style)).toBeTrue();

			Object.keys(style).forEach((t) => {
				expect(['string', 'unit']).toContain(stylus.functions.type(style[t]));
			});
		});

		const
			{rounding} = designSystem;

		expect(Object.isObject(rounding)).toBeTrue();
		expect(Object.keys(rounding).length).toBe(Object.keys(plainMock.rounding).length);

		Object.keys(rounding).forEach((key) => {
			expect(stylus.functions.type(rounding[key])).toBe('unit');
		});
	});

	it('should return value from getDSOptions', () => {
		const
			stylus = require('stylus'),
			{theme, includeThemes} = config.runtime(),
			themedFields = config.themedFields();

		const
			{data: ds, variables: cssVariables} = createDesignSystem(plainMock),
			plugins = createPlugins({ds, cssVariables, theme, includeThemes, themedFields, stylus});

		stylus.render('getDSOptions("colors", "green.0")', {use: [plugins]}, (err, hex) => {
			expect(hex).toEqual(stylus.render(plainMock.colors.green[0]));
		});
	});
});
