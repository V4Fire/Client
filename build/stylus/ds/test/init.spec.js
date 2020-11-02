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
	stylus = require('stylus'),
	{createDesignSystem} = include('build/stylus/ds/helpers');

const
	plainMock = include('build/stylus/ds/test/mocks/ds-plain');

describe('build/stylus/ds/init', () => {
	it('should create plain design system', () => {
		const
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
});
