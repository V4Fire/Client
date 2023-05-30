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
	{plainDesignSystem} = include('build/stylus/ds/test/scheme/plain'),
	{fullThemed} = include('build/stylus/ds/test/scheme/themes'),
	{createDesignSystem} = include('build/stylus/ds/helpers');

describe('build/stylus/ds', () => {
	it('should creates a plain design system', () => {
		const
			stylus = require('stylus'),
			{data: designSystem} = createDesignSystem(plainDesignSystem);

		expect(Object.isDictionary(designSystem.colors)).toBeTruthy();

		const
			{colors} = designSystem;

		Object.keys(colors).forEach((key) => {
			expect(Object.isArray(colors[key])).toBeTruthy();

			colors[key].forEach((c) => {
				expect(['expression', 'rgba']).toContain(stylus.functions.type(c));
			});
		});

		const
			{text} = designSystem;

		expect(Object.isDictionary(text)).toBeTruthy();
		expect(Object.keys(text).length).toBe(Object.keys(plainDesignSystem.text).length);

		Object.keys(text).forEach((key) => {
			const
				style = text[key];

			expect(Object.isDictionary(style)).toBeTruthy();

			Object.keys(style).forEach((t) => {
				expect(['string', 'unit']).toContain(stylus.functions.type(style[t]));
			});
		});

		const
			{rounding} = designSystem;

		expect(Object.isDictionary(rounding)).toBeTruthy();
		expect(Object.keys(rounding).length).toBe(Object.keys(plainDesignSystem.rounding).length);

		Object.keys(rounding).forEach((key) => {
			expect(stylus.functions.type(rounding[key])).toBe('unit');
		});
	});

	it('should creates a themed design system', () => {
		const
			stylus = require('stylus'),
			{data: designSystem} = createDesignSystem(fullThemed);

		expect(Object.isDictionary(designSystem.colors)).toBeTruthy();

		const
			{colors: {theme}} = designSystem;

		Object.keys(theme).forEach((key) => {
			Object.keys(theme[key]).forEach((colorSet) => {
				theme[key][colorSet].forEach((c) => {
					expect(['expression', 'rgba']).toContain(stylus.functions.type(c));
				});
			});
		});

		const
			{text: {theme: themedTextObj}} = designSystem;

		Object.keys(themedTextObj).forEach((themeName) => {
			Object.keys(themedTextObj[themeName]).forEach((id) => {
				const
					style = themedTextObj[themeName][id];

				expect(Object.isDictionary(style)).toBeTruthy();

				Object.keys(style).forEach((t) => {
					expect(['string', 'unit']).toContain(stylus.functions.type(style[t]));
				});
			});
		});

		const
			{rounding: {theme: themedRoundingObj}} = designSystem;

		expect(Object.isDictionary(themedRoundingObj)).toBeTruthy();

		Object.keys(themedRoundingObj).forEach((themeName) => {
			Object.keys(themedRoundingObj[themeName]).forEach((id) => {
				expect(stylus.functions.type(themedRoundingObj[themeName][id])).toBe('unit');
			});
		});
	});
});
