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
	{inherit, depsRgxpStr} = include('build/build.webpack'),
	{RUNTIME} = include('build/entities.webpack');

const excludeCustomNodeModules = new RegExp(
	`(?:^|[\\\\/])node_modules[\\/](?:${depsRgxpStr})(?:[\\\\/]|$)|^(?:(?!(?:^|[\\\\/])node_modules[\\\\/]).)*$`
);

const includeNotCustomNodeModules = new RegExp(
	`^(?:(?!(?:^|[\\\\/])node_modules[\\\\/]).)*[\\\\/]?node_modules[\\\\/](?:(?!${depsRgxpStr}).)*$`
);

/**
 * Returns a list of webpack optimizations
 *
 * @param {number} buildId - build id
 * @param {!Map} plugins - list of plugins
 * @returns {Array}
 */
module.exports = async function ({buildId, plugins}) {
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
					test: excludeCustomNodeModules
				},

				vendor: {
					name: 'vendor.js',
					chunks: 'all',
					priority: 1,
					minChunks: 1,
					enforce: true,
					reuseExistingChunk: true,
					test: includeNotCustomNodeModules
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
				terserOptions: inherit(config.uglify(), {
					safari10: true,
					warnings: false,
					ecma: es,
					keep_fnames: keepFNames,
					keep_classnames: true,

					output: {
						comments: false
					},

					mangle: {
						safari10: true
					}
				})
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
