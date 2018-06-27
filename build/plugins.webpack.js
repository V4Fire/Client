'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
	path = require('path'),
	webpack = require('webpack'),
	config = require('config');

const
	HardSourceWebpackPlugin = require('hard-source-webpack-plugin');

const
	{buildCache} = include('build/build.webpack');

/**
 * Returns a list of webpack plugins
 *
 * @param {(number|string)} buildId - build id
 * @returns {Map}
 */
module.exports = async function ({buildId}) {
	const
		build = await include('build/entities.webpack');

	const plugins = new Map([
		['globals', new webpack.DefinePlugin(include('build/globals.webpack'))],
		['dependencies', include('build/dependencies.webpack')({build})]
	]);

	if (!isProd) {
		plugins.set('buildCache', new HardSourceWebpackPlugin({
			environmentHash: {files: ['package-lock.json', 'yarn.lock']},
			cacheDirectory: path.join(buildCache, buildId, config.webpack.cacheDirectory),
			configHash: () => require('node-object-hash')().hash(global.WEBPACK_CONFIG)
		}));
	}

	return plugins;
};
