/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

'use strict';

const
	config = require('@config/config');

const
	{isExternalDep} = include('build/const'),
	{isJsFile} = include('build/webpack/module/const');

const
	monic = config.monic(),
	swcOptions = config.webpack.swc();

const
	{inherit} = include('build/helpers');

/**
 * Returns webpack rules for the javascript files
 *
 * @returns {import('webpack').RuleSetRule}
 */
module.exports = function jsRules() {
	return {
		test: isJsFile,
		oneOf: [
			{
				exclude: isExternalDep,
				use: [
					{
						loader: 'swc-loader',
						options: swcOptions.js
					},
					{
						loader: 'monic-loader',
						options: inherit(monic.javascript, {
							replacers: [
								include('build/monic/require-context'),
								include('build/monic/super-import'),
								include('build/monic/dynamic-component-import')
							]
						})
					}
				]
			},
			{
				include: /\/node_modules\/(@?vue)\//,
				use: [
					{
						loader: 'swc-loader',
						options: swcOptions.js
					}
				]
			}
		]
	};
};
