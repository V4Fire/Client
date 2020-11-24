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
	{fullThemed} = include('build/stylus/ds/test/scheme/themes'),
	{plainDesignSystem} = include('build/stylus/ds/test/scheme/plain'),
	createPlugins = include('build/stylus/ds/plugins'),
	{createDesignSystem} = include('build/stylus/ds/helpers');

describe('build/stylus/plugins/included-themes', () => {
	it('should return all included themes', () => {
		const
			stylus = require('stylus'),
			theme = 'day';

		const
			{data: ds, variables: cssVariables} = createDesignSystem(fullThemed),
			plugins = createPlugins({ds, cssVariables, theme, stylus, includeThemes: true});

		stylus.render('.foo\n\tcontent join(".", includedThemes())', {use: [plugins]}, (err, value) => {
			expect(value.includes('content: \'day.night\'')).toBeTrue();
		});
	});

	it('should return only specified included theme', () => {
		const
			stylus = require('stylus'),
			theme = 'night';

		const
			{data: ds, variables: cssVariables} = createDesignSystem(fullThemed),
			plugins = createPlugins({ds, cssVariables, theme, stylus, includeThemes: ['night']});

		stylus.render('.foo\n\tcontent join(".", includedThemes())', {use: [plugins]}, (err, value) => {
			expect(value.includes('content: \'night\'')).toBeTrue();
		});
	});

	it('should not return included themes for non themed design system', () => {
		const
			stylus = require('stylus'),
			theme = 'day';

		const
			{data: ds, variables: cssVariables} = createDesignSystem(plainDesignSystem),
			plugins = createPlugins({ds, cssVariables, theme, stylus});

		stylus.render('.foo\n\tcontent join(".", includedThemes())', {use: [plugins]}, (err, value) => {
			expect(value.includes('content: \'null\'')).toBeTrue();
		});
	});
});
