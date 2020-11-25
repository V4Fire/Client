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
	TerserPlugin = require('terser-webpack-plugin'),
	OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');

const
	{isLayerCoreDep, isLayerDep, isExternalDep} = include('build/const'),
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

	if (buildId === RUNTIME) {
		options.runtimeChunk = {
			name: 'webpack.runtime'
		};

		options.splitChunks = {
			cacheGroups: {
				index: {
					name: 'index-core',
					chunks: 'initial',
					minChunks: 2,
					enforce: true,
					reuseExistingChunk: true,
					test: isLayerCoreDep
				},

				async: {
					chunks: 'async',
					minChunks: 2,
					reuseExistingChunk: true,
					test: isLayerDep
				},

				defaultVendors: {
					name: 'vendor',
					chunks: 'initial',
					minChunks: 1,
					enforce: true,
					reuseExistingChunk: true,
					test: isExternalDep
				},

				asyncVendors: {
					chunks: 'async',
					minChunks: 2,
					reuseExistingChunk: true,
					test: isExternalDep
				}
			}
		};
	}

	if (isProd) {
		const
			es = config.es(),
			keepFNames = Boolean({ES5: true, ES3: true}[es]);

		options.minimizer = [
			/* eslint-disable camelcase */

			new TerserPlugin({
				parallel: true,
				terserOptions: inherit({
					safari10: true,
					warnings: false,
					ecma: es,
					keep_fnames: keepFNames,
					keep_classnames: true,

					output: {
						comments: false
					}
				}, config.uglify())
			})

			/* eslint-enable camelcase */
		];
	}

	const
		css = config.css();

	if (css.minimize) {
		plugins.set('minimizeCSS', new OptimizeCssAssetsPlugin({...css.minimize}));
	}

	return options;
};
