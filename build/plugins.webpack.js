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
	webpack = require('webpack');

const
	HardSourceWebpackPlugin = require('hard-source-webpack-plugin');

const
	{buildCache} = include('build/build.webpack');

/**
 * Returns a list of webpack plugins
 *
 * @param {(number|string)} buildId - build id
 * @returns {Array}
 */
module.exports = async function ({buildId}) {
	const
		build = await include('build/entities.webpack');

	const plugins = [
		new webpack.DefinePlugin(include('build/globals.webpack')),
		include('build/dependencies.webpack')({build})
	];

	if (!isProd) {
		plugins.push(new HardSourceWebpackPlugin({
			cacheDirectory: path.join(buildCache, `${buildId}/[confighash]`),
			environmentHash: {files: ['package-lock.json', 'yarn.lock']},
			configHash: () => require('node-object-hash')().hash(global.WEBPACK_CONFIG)
		}));
	}

	return plugins;
};
