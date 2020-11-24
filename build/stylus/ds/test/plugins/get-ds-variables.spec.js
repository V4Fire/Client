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
	createPlugins = include('build/stylus/ds/plugins'),
	{createDesignSystem} = include('build/stylus/ds/helpers');

describe('build/stylus/plugins/get-ds-variables', () => {
	it('should return variables', () => {
		const
			stylus = require('stylus');

		const
			{data: ds, variables: cssVariables} = createDesignSystem(plainDesignSystem),
			plugins = createPlugins({ds, cssVariables, stylus});

		stylus.render('getDSVariables()', {use: [plugins]}, (err, value) => {
			expect(value).toBeTruthy();
		});
	});
});
