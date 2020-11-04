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
	{getThemes} = include('build/ds'),
	{fullThemedMock} = include('build/stylus/ds/test/mocks/ds-themes'),
	plainMock = include('build/stylus/ds/test/mocks/ds-plain'),
	{dsHasThemesNotIncluded} = include('build/stylus/ds/const');

describe('build/ds', () => {
	it('should crash by passing a themed design system without specific build themes', () => {
		expect(() => getThemes(fullThemedMock)).toThrowError(dsHasThemesNotIncluded);
	});

	it('should crash by passing a themed design system with an empty array of build themes', () => {
		expect(() => getThemes(fullThemedMock, [])).toThrowError(dsHasThemesNotIncluded);
	});

	it('should crash by passing a themed design system with not included build themes', () => {
		expect(() => getThemes(fullThemedMock, ['morning']))
			.toThrowError(dsHasThemesNotIncluded);
	});

	it('should return all themes that included in the specified design system object', () => {
		expect(getThemes(fullThemedMock, true)).toEqual(fullThemedMock.meta.themes);
	});

	it('should return only specified theme', () => {
		expect(getThemes(fullThemedMock, ['day'])).toEqual(['day']);
	});

	it('should notify by passing a plain design system (without themes)', () => {
		console.log = jasmine.createSpy('log');

		expect(getThemes(plainMock)).toBe(null);
		expect(console.log).toHaveBeenCalledWith('Specified design system has no themes');
	});
});
