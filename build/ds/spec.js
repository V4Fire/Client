'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

require('@config/config');

const
	{getThemes} = include('build/ds'),
	{fullThemed} = include('build/stylus/ds/test/scheme/themes'),
	{plainDesignSystem} = include('build/stylus/ds/test/scheme/plain'),
	{dsHasThemesNotIncluded} = include('build/stylus/ds/const');

describe('build/ds', () => {
	it('should crash by passing a themed design system without specific build themes', () => {
		expect(() => getThemes(fullThemed)).toThrowError(dsHasThemesNotIncluded);
	});

	it('should crash by passing a themed design system with an empty array of build themes', () => {
		expect(() => getThemes(fullThemed, [])).toThrowError(dsHasThemesNotIncluded);
	});

	it('should crash by passing a themed design system with not included build themes', () => {
		expect(() => getThemes(fullThemed, ['morning']))
			.toThrowError(dsHasThemesNotIncluded);
	});

	it('should return all themes that included in the specified design system object', () => {
		expect(getThemes(fullThemed, true)).toEqual(fullThemed.meta.themes);
	});

	it('should return the only specified theme', () => {
		expect(getThemes(fullThemed, ['day'])).toEqual(['day']);
	});

	it('should return null by passing a plain design system (without themes)', () => {
		expect(getThemes(plainDesignSystem)).toBe(null);
	});
});
