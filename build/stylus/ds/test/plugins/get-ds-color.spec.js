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
	{plainWithDeepColorObjects} = include('build/stylus/ds/test/scheme/plain'),
	{createDesignSystem} = include('build/stylus/ds/helpers');

describe('build/stylus/plugins/get-ds-color', () => {
	describe('should returns a value', () => {
		let plugins, stylus;

		beforeAll(() => {
			stylus = require('stylus');
		});

		beforeEach(() => {
			const {data: ds, variables: cssVariables} = createDesignSystem(plainWithDeepColorObjects);

			plugins = getPlugins({ds, cssVariables, stylus});
		});

		it('simple name', () => {
			stylus.render('getDSColor("White")', {use: [plugins]}, (err, hex) => {
				expect(hex).toEqual(stylus.render(plainWithDeepColorObjects.colors.White));
			});
		});

		it('simple name with "id"', () => {
			stylus.render('getDSColor("blue", 1)', {use: [plugins]}, (err, hex) => {
				expect(hex).toEqual(stylus.render(plainWithDeepColorObjects.colors.blue[0]));
			});
		});

		it('name with "/" and space', () => {
			stylus.render('getDSColor("black alpha/black")', {use: [plugins]}, (err, hex) => {
				expect(hex).toEqual(stylus.render(plainWithDeepColorObjects.colors.blackAlpha.black));
			});
		});

		it('name with multiple "/"', () => {
			stylus.render('getDSColor("decor/primary/red")', {use: [plugins]}, (err, hex) => {
				expect(hex).toEqual(stylus.render(plainWithDeepColorObjects.colors.decor.primary.red));
			});
		});

		it('name with dot', () => {
			stylus.render('getDSColor("whiteAlpha.white")', {use: [plugins]}, (err, hex) => {
				expect(hex).toEqual(stylus.render(plainWithDeepColorObjects.colors.whiteAlpha.white));
			});
		});

		it('name with multiple dots', () => {
			stylus.render('getDSColor("decor.primary.red")', {use: [plugins]}, (err, hex) => {
				expect(hex).toEqual(stylus.render(plainWithDeepColorObjects.colors.decor.primary.red));
			});
		});

		it('name in PascalCase with dots', () => {
			stylus.render('getDSColor("Black.Black")', {use: [plugins]}, (err, hex) => {
				expect(hex).toEqual(stylus.render(plainWithDeepColorObjects.colors.Black.Black));
			});
		});

		it('name with mixed case and "/"', () => {
			stylus.render('getDSColor("white-alpha/White")', {use: [plugins]}, (err, hex) => {
				expect(hex).toEqual(stylus.render(plainWithDeepColorObjects.colors['white-alpha'].White));
			});
		});

		it('name with mixed case and dot', () => {
			stylus.render('getDSColor("white-alpha.White")', {use: [plugins]}, (err, hex) => {
				expect(hex).toEqual(stylus.render(plainWithDeepColorObjects.colors['white-alpha'].White));
			});
		});
	});
});
