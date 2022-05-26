'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
	$C = require('collection.js');

const
	config = require('@config/config'),
	webpack = require('webpack');

const statoscopeOptions = {
	saveReportTo: './statoscope/report-[name].html',
  saveStatsTo: 'stats-[name].json',
  open: false
};

/**
 * Returns options for `webpack.plugins`
 * @returns {!Map}
 */
module.exports = async function plugins({name}) {
	const
		globals = include('build/globals.webpack');

	const
		DependenciesPlugin = include('build/webpack/plugins/dependencies'),
		createProgressPlugin = include('build/webpack/plugins/progress-plugin'),
		StatoscopeWebpackPlugin = require('@statoscope/webpack-plugin').default,
		IgnoreInvalidWarningsPlugin = include('build/webpack/plugins/ignore-invalid-warnings');

	const plugins = new Map([
		['globals', new webpack.DefinePlugin(await $C(globals).async.map())],
		['dependencies', new DependenciesPlugin()],
		['ignoreNotFoundExport', new IgnoreInvalidWarningsPlugin()],
		['statoscope', new StatoscopeWebpackPlugin(statoscopeOptions)]
	]);

	if (config.webpack.progress()) {
		plugins.set('progress-plugin', createProgressPlugin(name));
	}

	return plugins;
};
