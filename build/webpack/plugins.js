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
		globals = include('build/globals.webpack'),
		DependenciesPlugin = include('build/webpack/plugins/dependencies'),
		StatoscopeWebpackPlugin = require('@statoscope/webpack-plugin').default,
		SimpleProgressWebpackPlugin = require('simple-progress-webpack-plugin'),
		IgnoreInvalidWarningsPlugin = include('build/webpack/plugins/ignore-invalid-warnings'),
		progressWebpackConfig = config.progressWebpackConfig(),
		statoscopeConfig = config.statoscopePlugin();

	return new Map([
		['globals', new webpack.DefinePlugin(await $C(globals).async.map())],
		['dependencies', new DependenciesPlugin()],
		['ignoreNotFoundExport', new IgnoreInvalidWarningsPlugin()],
		progressWebpackConfig.enabled &&
			['simpleProgressWebpackPlugin', new SimpleProgressWebpackPlugin({name, ...progressWebpackConfig})],
		statoscopeConfig.enabled &&
			['StatoscopeWebpackPlugin', new StatoscopeWebpackPlugin(statoscopeConfig)]
	].filter(Boolean));
};
