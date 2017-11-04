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
	config = require('config'),
	ExtractTextPlugin = require('extract-text-webpack-plugin');

const
	{hash, version, hashLength} = include('build/helpers.webpack');

module.exports = function ({build, output, folders}) {
	return {
		rules: [
			{
				test: /\.js$/,
				exclude: /node_modules\/(?!@v4fire)/,
				use: [
					{
						loader: 'babel',
						options: config.babel.client
					},

					{
						loader: 'prop',
						options: {
							modules: folders
						}
					},

					{
						loader: 'proxy',
						options: {
							modules: folders
						}
					}
				]
			},

			{
				test: /workers\/\w+\.js$/,
				exclude: /node_modules\/(?!@v4fire)/,
				use: [
					{
						loader: 'babel',
						options: Object.assign({}, config.babel.client, {
							plugins: config.babel.clientWithRuntime()
						})
					}
				]
			},

			{
				test: /\.styl$/,
				use: ExtractTextPlugin.extract({
					fallback: 'style',
					use: [].concat(
						{
							loader: 'css',
							options: {
								minimize: Boolean(isProd || env.MINIFY_CSS === 'true')
							}
						},

						isProd ? [
							{
								loader: 'postcss',
								options: {
									plugins: [require('autoprefixer')()]
								}
							}

						] : [],

						{
							loader: 'stylus',
							options: {
								use: include('build/stylus.plugins'),
								preferPathResolver: 'webpack'
							}
						},

						{
							loader: 'monic',
							options: $C.extend({deep: true, concatArray: true}, {}, config.monic.styl, {
								replacers: [
									Object.assign(include('build/stylus-import.replacer'), {folders, lib}),
									require('@pzlr/stylus-inheritance')
								]
							})
						}
					)
				})
			},

			{
				test: /\.ss$/,
				use: [
					{
						loader: 'snakeskin',
						options: config.snakeskin.client
					}
				]
			},

			{
				test: /\.ess$/,
				use: [
					{
						loader: 'file',
						options: {
							name: `${output.replace(/\[hash]_/, '')}.html`
						}
					},

					'extract',
					'html',

					{
						loader: 'snakeskin',
						options: Object.assign({}, config.snakeskin.server, {
							exec: true,
							data: {
								root: cwd,
								output: config.src.clientOutput(),
								dependencies: build.dependencies,
								assets: config.src.assets(),
								version,
								hashLength,
								lib
							}
						})
					}
				]
			},

			{
				test: /\.(png|gif|jpg|svg|ttf|eot|woff|woff2|mp3|ogg|aac)$/,
				use: [
					{
						loader: 'url',
						options: {
							name: hash('[path][hash]_[name].[ext]'),
							limit: 4096
						}
					}
				]
			}
		]
	};
};
