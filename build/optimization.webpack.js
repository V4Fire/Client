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
	UglifyJsPlugin = require('uglifyjs-webpack-plugin');

const
	{inherit, depsRgxpStr} = include('build/build.webpack');

const
	excludeCustomNodeModules = new RegExp(`(?:^|/)node_modules/(?:${depsRgxpStr})(?:/|$)|^(?:(?!(?:^|/)node_modules/).)*$`),
	excludeNotCustomNodeModules = new RegExp(`^(?:(?!(?:^|/)node_modules/).)*/?node_modules/(?:(?!${depsRgxpStr}).)*$`);

/**
 * Returns a list of webpack optimizations
 *
 * @param {(number|string)} buildId - build id
 * @returns {Array}
 */
module.exports = async function ({buildId}) {
	const base = {
		'0': true,
		'00': true
	}[buildId];

	const
		options = {};

	if (base) {
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
					minChunks: 2,
					enforce: true,
					reuseExistingChunk: true,
					test: excludeNotCustomNodeModules
				}
			}
		};
	}

	if (isProd) {
		options.minimizer = [
			/* eslint-disable camelcase */

			new UglifyJsPlugin({
				parallel: true,
				uglifyOptions: inherit(config.uglify, {
					compress: {
						warnings: false,
						keep_classnames: true,
						keep_fnames: true
					},

					output: {
						comments: false
					},

					mangle: false
				})
			})

			/* eslint-enable camelcase */
		];
	}

	return options;
};
