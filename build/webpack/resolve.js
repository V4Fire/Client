'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
	TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin'),
	{src} = require('@config/config'),
	{resolve} = require('@pzlr/build-core');

const extensions = ['.ts', '.js', '.json'];

/**
 * Options for `webpack.resolve`
 */
module.exports = {
	extensions,
	modules: [...new Set([resolve.blockSync(), resolve.sourceDir, src.cwd(), ...resolve.rootDependencies, src.lib()])],
	plugins: [
		new TsconfigPathsPlugin({
			extensions
		})
	],
	alias: include('build/webpack/alias')
};
