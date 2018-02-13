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
	{src} = require('config'),
	{resolve} = require('@pzlr/build-core'),
	{output, hash, version, hashLength} = include('build/build.webpack');

/**
 * Parameters for webpack.module
 * @type {Promise<Object>}
 */
module.exports = (async () => {
	const
		build = await include('build/entities.webpack');

	return {
		rules: [
			{
				test: /\.ts/,
				exclude: /node_modules\/(?!@v4fire)/,
				use: [
					{
						loader: 'ts'
					},

					{
						loader: 'proxy',
						options: {
							modules: [resolve.sourceDir, ...resolve.rootDependencies]
						}
					},

					{
						loader: 'monic',
						options: {
							replacers: [
								include('build/ts-import.replacer')
							]
						}
					}
				]
			},

			{
				test: /workers\/\w+\.ts$/,
				exclude: /node_modules\/(?!@v4fire)/,
				use: [{loader: 'ts'}]
			},

			{
				test: /\.styl$/,
				use: ExtractTextPlugin.extract({
					fallback: 'style',
					use: [].concat(
						{
							loader: 'css',
							options: {
								minimize: Boolean(isProd || Number(process.env.MINIFY_CSS))
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
							options: $C.extend({deep: true, concatArray: true}, config.monic().styl, {
								replacers: [
									require('@pzlr/stylus-inheritance')({resolveImports: true})
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
						options: config.snakeskin().client
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
						options: Object.assign(config.snakeskin().server, {
							exec: true,
							data: {
								root: src.cwd(),
								output: src.clientOutput(),
								dependencies: build.dependencies,
								assets: src.assets(),
								lib: src.lib(),
								version,
								hashLength
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
})();
