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
	config = require('config'),
	webpack = require('webpack');

const
	HardSourceWebpackPlugin = require('hard-source-webpack-plugin'),
	ExtractTextPlugin = require('extract-text-webpack-plugin'),
	AssetsWebpackPlugin = require('assets-webpack-plugin'),
	WebpackMd5Hash = require('webpack-md5-hash');

const
	{cwd} = config.src,
	{hash} = include('build/helpers.webpack');

module.exports = function ({build, assetsJSON, output, i}) {
	const base = {
		'0': true,
		'00': true
	}[i];

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

			plugins.push(new WebpackMd5Hash());
		}

	} else {
		plugins.push(new HardSourceWebpackPlugin({
			cacheDirectory: path.join(cwd, `app-cache/${i}/[confighash]`),
			recordsPath: path.join(cwd, `app-cache/${i}/[confighash]/records.json`),
			environmentHash: {files: ['package-lock.json']},
			configHash: (webpackConfig) => require('node-object-hash')().hash(webpackConfig)
		}));
	}

	return plugins;
};
