'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
	$C = require('collection.js'),
	path = require('path'),
	webpack = require('webpack');

const
	HardSourceWebpackPlugin = require('hard-source-webpack-plugin'),
	ExtractTextPlugin = require('extract-text-webpack-plugin'),
	AssetsWebpackPlugin = require('assets-webpack-plugin');

const
	{output, assetsJSON, hash, buildCache} = include('build/build.webpack');

/**
 * Returns a list of webpack plugins
 *
 * @param {(number|string)} buildId - build id
 * @returns {Array}
 */
module.exports = async function ({buildId}) {
	const
		build = await include('build/entities.webpack');

	const base = {
		'0': true,
		'00': true
	}[buildId];

	const plugins = [
		new webpack.DefinePlugin(include('build/globals.webpack')),
		new ExtractTextPlugin(`${hash(output, true)}.css`),
		new AssetsWebpackPlugin({filename: assetsJSON, update: true})
	];

	if (base) {
		plugins.push(new webpack.optimize.CommonsChunkPlugin({
			name: 'index.js',
			chunks: $C(Object.keys(build.entry)).get((el) => /^[^$]+\.js$/.test(el)),
			minChunks: 2,
			async: false
		}));
	}

	if (isProd) {
		if (!Number(process.env.DEBUG)) {
			/* eslint-disable camelcase */

			plugins.push(new webpack.optimize.UglifyJsPlugin({
				compress: {
					warnings: false,
					keep_fnames: true
				},

				output: {
					comments: false
				},

				mangle: false
			}));

			/* eslint-enable camelcase */
		}

	} else {
		plugins.push(new HardSourceWebpackPlugin({
			cacheDirectory: path.join(buildCache, `${i}/[confighash]`),
			recordsPath: path.join(buildCache, `${i}/[confighash]/records.json`),
			environmentHash: {files: ['package-lock.json']},
			configHash: (webpackConfig) => require('node-object-hash')().hash(webpackConfig)
		}));
	}

	return plugins;
};
