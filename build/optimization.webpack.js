'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
	config = require('config'),
	webpack = require('webpack');

const
	TerserPlugin = require('terser-webpack-plugin'),
	CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

const
	{optimize} = config.webpack,
	{isLayerDep, isLayerCoreDep, isExternalDep} = include('build/const'),
	{inherit} = include('build/helpers.webpack'),
	{RUNTIME} = include('build/graph.webpack');

/**
 * Returns options for Webpack ".optimization"
 *
 * @param {(number|string)} buildId - build id
 * @param {!Map} plugins - map of plugins to use
 * @returns {!Object}
 */
module.exports = function optimization({buildId, plugins}) {
	const
		options = {};

	if (optimize.minChunkSize) {
		plugins.set(
			'minChunkSize',
			new webpack.optimize.MinChunkSizePlugin({minChunkSize: optimize.minChunkSize})
		);
	}

	if (buildId === RUNTIME) {
		options.runtimeChunk = {
			name: 'webpack.runtime'
		};

		options.splitChunks = inherit(optimize.splitChunks(), {
			cacheGroups: {
				index: {
					name: 'index-core',
					chunks: 'all',
					minChunks: 2,
					enforce: true,
					reuseExistingChunk: true,
					test: isLayerCoreDep
				},

				async: {
					chunks: 'async',
					minChunks: 1,
					reuseExistingChunk: true,
					test: isLayerDep
				},

				defaultVendors: {
					name: 'vendor',
					chunks: 'all',
					minChunks: 2,
					enforce: true,
					reuseExistingChunk: true,
					test: isExternalDep
				}
			}
		});
	}

	const
		es = config.es();

	options.minimizer = [
		new CssMinimizerPlugin(config.cssMinimizer()),

		/* eslint-disable camelcase */

		new TerserPlugin({
			parallel: true,
			terserOptions: inherit({
				ecma: es,

				safari10: true,
				warnings: false,

				keep_fnames: /ES[35]$/.test(es),
				keep_classnames: true,

				output: {
					comments: false
				}
			}, config.terser())
		})

		/* eslint-enable camelcase */
	];

	return options;
};
