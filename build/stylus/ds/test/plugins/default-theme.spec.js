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
	getPlugins = include('build/stylus/ds/plugins');

const
	{plainDesignSystem} = include('build/stylus/ds/test/scheme/plain'),
	{createDesignSystem} = include('build/stylus/ds/helpers');

describe('build/stylus/plugins/default-theme', () => {
	it('should returns a build theme', () => {
		const
			stylus = require('stylus'),
			theme = 'day';

		const
			{data: ds, variables: cssVariables} = createDesignSystem(plainDesignSystem),
			plugins = getPlugins({ds, cssVariables, theme, stylus});

		stylus.render('defaultTheme()', {use: [plugins]}, (err, value) => {
			expect(value.trim()).toEqual(`'${theme}'`);
		});
	});
});
