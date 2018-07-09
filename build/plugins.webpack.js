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
	{buildCache, stdCache} = include('build/build.webpack');

/**
 * Returns a list of webpack plugins
 *
 * @param {(number|string)} buildId - build id
 * @param {boolean} isSTD
 * @returns {Map}
 */
module.exports = async function ({buildId, isSTD}) {
	const
		build = await include('build/entities.webpack');

	const plugins = new Map([
		['globals', new webpack.DefinePlugin(include('build/globals.webpack'))],
		['dependencies', include('build/dependencies.webpack')({build})]
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
