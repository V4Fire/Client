'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
	$C = require('collection.js'),
	config = require('config'),
	path = require('path');

const
	webpack = require('webpack'),
	HardSourceWebpackPlugin = require('hard-source-webpack-plugin');

const
	build = include('build/entries.webpack'),
	{buildCache} = include('build/build.webpack');

/**
 * Returns options for Webpack ".plugins"
 *
 * @param {(number|string)} buildId - build id
 * @returns {!Map}
 */
module.exports = async function plugins({buildId}) {
	const
		graph = await build;

	const plugins = new Map([
		['globals', new webpack.DefinePlugin(await $C(include('build/globals.webpack')).async.map())],
		['dependencies', include('build/plugins/dependencies')({graph})]
	]);

	if (config.webpack.buildCache()) {
		plugins.set('buildCache', new HardSourceWebpackPlugin({
			environmentHash: {
				files: [
					'package-lock.json',
					'yarn.lock'
				]
			},

			cacheDirectory: path.join(
				buildCache,
				String(buildId),
				config.webpack.cacheDir()
			),

			configHash: () => config.build.hash({webpack: globalThis.WEBPACK_CONFIG})
		}));
	}

	return plugins;
};
