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
	getPlugins = include('build/stylus/ds/plugins');

const
	{fullThemed} = include('build/stylus/ds/test/scheme/themes'),
	{plainDesignSystem} = include('build/stylus/ds/test/scheme/plain'),
	{createDesignSystem} = include('build/stylus/ds/helpers');

describe('build/stylus/plugins/included-themes', () => {
	it('should returns all included themes', () => {
		const
			stylus = require('stylus'),
			theme = 'day';

		const
			{data: ds, variables: cssVariables} = createDesignSystem(fullThemed),
			plugins = getPlugins({ds, cssVariables, theme, stylus, includeThemes: true});

		stylus.render('.foo { content: join(".", availableThemes()) }', {use: [plugins]}, (err, value) => {
			expect(value.includes(`content: '${ds.raw.meta.themes.join('.')}'`)).toBeTrue();
		});
	});

	it('should returns only the specified included theme', () => {
		const
			stylus = require('stylus');

		const
			includeThemes = ['night'],
			{data: ds, variables: cssVariables} = createDesignSystem(fullThemed),
			plugins = getPlugins({ds, cssVariables, theme: includeThemes[0], stylus, includeThemes});

		stylus.render('.foo { content: join(".", availableThemes()) }', {use: [plugins]}, (err, value) => {
			expect(value.includes(`content: '${includeThemes.join('.')}'`)).toBeTrue();
		});
	});

	it('should not return included themes for the non-themed design system', () => {
		const
			stylus = require('stylus'),
			theme = 'day';

		const
			{data: ds, variables: cssVariables} = createDesignSystem(plainDesignSystem),
			plugins = getPlugins({ds, cssVariables, theme, stylus});

		stylus.render('.foo { content: join(".", availableThemes()) }', {use: [plugins]}, (err, value) => {
			expect(value.includes('content: \'null\'')).toBeTrue();
		});
	});
});
