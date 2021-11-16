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
	webpack = require('webpack');

/**
 * Returns options for `webpack.plugins`
 * @returns {!Map}
 */
module.exports = async function plugins({name}) {
	const
		globals = include('build/globals.webpack');

	const
		DependenciesPlugin = include('build/webpack/plugins/dependencies'),
		SimpleProgressWebpackPlugin = require('simple-progress-webpack-plugin'),
		IgnoreInvalidWarningsPlugin = include('build/webpack/plugins/ignore-invalid-warnings');

	const plugins = new Map([
		['globals', new webpack.DefinePlugin(await $C(globals).async.map())],
		['dependencies', new DependenciesPlugin()],
		['ignoreNotFoundExport', new IgnoreInvalidWarningsPlugin()]
	]);

	const
		progressWebpackConfig = config.simpleProgressWebpackPlugin();

	if (progressWebpackConfig.enabled) {
		plugins.set('simpleProgressWebpackPlugin', new SimpleProgressWebpackPlugin({name, ...progressWebpackConfig}));
	}

	return plugins;
};
