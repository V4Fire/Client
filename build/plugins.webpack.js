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
	HardSourceWebpackPlugin = require('hard-source-webpack-plugin'),
	build = include('build/entities.webpack');

const
	{buildCache, stdCache} = include('build/build.webpack');

/**
 * Returns a list of webpack plugins
 *
 * @param {number} buildId - build id
 * @returns {Map}
 */
module.exports = async function ({buildId}) {
	const
		isSTD = buildId === build.STD,
		graph = await build;

	const plugins = new Map([
		['globals', new webpack.DefinePlugin(include('build/globals.webpack'))],
		['dependencies', include('build/dependencies.webpack')({graph})]
	]);

	if (!isProd) {
		plugins.set('buildCache', new HardSourceWebpackPlugin({
			environmentHash: {files: ['package-lock.json', 'yarn.lock']},
			cacheDirectory: path.join(isSTD ? stdCache : buildCache, String(buildId), config.webpack.cacheDir()),
			configHash: () => require('node-object-hash')().hash(global.WEBPACK_CONFIG)
		}));
	}

	return plugins;
};
