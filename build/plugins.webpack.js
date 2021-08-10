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
	webpack = require('webpack');

/**
 * Returns options for Webpack ".plugins"
 * @returns {!Map}
 */
module.exports = async function plugins() {
	const
		globals = include('build/globals.webpack'),
		DependenciesPlugin = include('build/plugins/dependencies'),
		IgnoreNotFoundExportPlugin = include('build/plugins/ignore-not-found-export');

	return new Map([
		['globals', new webpack.DefinePlugin(await $C(globals).async.map())],
		['dependencies', new DependenciesPlugin()],
		['ignoreNotFoundExport', new IgnoreNotFoundExportPlugin()]
	]);
};
