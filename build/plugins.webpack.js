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
	return new Map([
		['globals', new webpack.DefinePlugin(await $C(include('build/globals.webpack')).async.map())],
		['dependencies', include('build/plugins/dependencies')()]
	]);
};
