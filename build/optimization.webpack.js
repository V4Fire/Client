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
	{isLayerDep, isExternalDep} = include('build/const'),
	{inherit} = include('build/build.webpack'),
	{RUNTIME} = include('build/entries.webpack');

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
			name: 'webpack.runtime.js'
		};

		options.splitChunks = {
			cacheGroups: {
				index: {
					name: 'index.js',
					chunks: 'all',
					priority: 0,
					minChunks: 2,
					enforce: true,
					reuseExistingChunk: true,
					test: isLayerDep
				},

				vendor: {
					name: 'vendor.js',
					chunks: 'all',
					priority: 1,
					minChunks: 1,
					enforce: true,
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
