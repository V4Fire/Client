/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

'use strict';

const
	config = require('@config/config'),
	webpack = require('webpack');

const
	TerserPlugin = require('terser-webpack-plugin'),
	CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

const {
	isLayerDep,
	isExternalDep,

	RUNTIME
} = include('build/const');

const
	{inherit} = include('build/helpers'),
	{ssr, optimize} = config.webpack;

/**
 * Returns parameters for `webpack.optimization`
 *
 * @param {object} opts
 * @param {(number|string)} opts.buildId
 * @param {Map} opts.plugins - a map of plugins to use
 * @returns {object}
 */
module.exports = function optimization({buildId, plugins}) {
	const
		params = {},
		cssMinimizer = new CssMinimizerPlugin(config.cssMinimizer());

	if (optimize.minChunkSize) {
		plugins.set(
			'minChunkSize',
			new webpack.optimize.MinChunkSizePlugin({minChunkSize: optimize.minChunkSize})
		);
	}

	if (buildId === RUNTIME) {
		params.splitChunks = inherit(optimize.splitChunks(), {
			cacheGroups: {
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

	/* eslint-disable camelcase */

	const jsMinimizer = new TerserPlugin({
		parallel: true,

		// Disable extraction of license headers into separate files
		extractComments: false,

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
	});

	/* eslint-enable camelcase */

	params.minimizer = [cssMinimizer, jsMinimizer];
	return params;
};
