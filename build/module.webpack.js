'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
	$C = require('collection.js');

const
	config = require('config'),
	ExtractTextPlugin = require('extract-text-webpack-plugin');

const
	{src} = require('config'),
	{resolve} = require('@pzlr/build-core'),
	{output, hash, hashLength, assetsJSON, inherit, depsRgxpStr} = include('build/build.webpack');

const
	depsRgxp = new RegExp(`(?:^|/)node_modules/(?:(?!${depsRgxpStr}).)*?(?:/|$)`);

/**
 * Returns parameters for webpack.module
 *
 * @param {(number|string)} buildId - build id
 * @param {Array} plugins - list of plugins
 * @return {Promise<Object>}
 */
module.exports = async function ({buildId, plugins}) {
	const
		build = await include('build/entities.webpack');

	const base = {
		'0': true,
		'00': true
	}[buildId];

	const loaders = {
		rules: []
	};

	if (base) {
		loaders.rules.push(
			{
				test: /^(?:(?!\/workers\/).)*\.ts$/,
				exclude: depsRgxp,
				use: [
					{
						loader: 'ts',
						options: config.typescript().client
					},

					{
						loader: 'proxy',
						options: {
							modules: [resolve.blockSync(), resolve.sourceDir, ...resolve.rootDependencies]
						}
					},

					{
						loader: 'monic',
						options: inherit(config.monic().typescript, {
							replacers: [
								include('build/context.replacer'),
								include('build/super.replacer'),
								include('build/ts-import.replacer')
							]
						})
					}
				]
			},

			{
				test: /\/workers\/.*?\.ts$/,
				exclude: depsRgxp,
				use: [
					{
						loader: 'ts',
						options: config.typescript().worker
					},

					{
						loader: 'monic',
						options: inherit(config.monic().typescript, {
							replacers: [
								include('build/context.replacer'),
								include('build/super.replacer'),
								include('build/ts-import.replacer')
							]
						})
					}
				]
			},

			{
				test: /\.js$/,
				exclude: depsRgxp,
				use: [{
					loader: 'monic',
					options: inherit(config.monic().javascript, {
						replacers: [
							include('build/context.replacer'),
							include('build/super.replacer')
						]
					})
				}]
			}
		);

	} else {
		plugins.push(
			new ExtractTextPlugin(`${hash(output, true)}.css`)
		);

		loaders.rules.push(
			{
				test: /\.styl$/,
				use: ExtractTextPlugin.extract({
					fallback: 'style',
					use: [].concat(
						{
							loader: 'css',
							options: config.css()
						},

						$C(config.postcss).length() ? {
							loader: 'postcss',
							options: inherit(config.postcss, {
								plugins: [require('autoprefixer')(config.autoprefixer())]
							})
						} : [],

						{
							loader: 'stylus',
							options: inherit(config.stylus(), {
								use: include('build/stylus.plugins')
							})
						},

						{
							loader: 'monic',
							options: inherit(config.monic().stylus, {
								replacers: [
									require('@pzlr/stylus-inheritance')({resolveImports: true})
								]
							})
						}
					)
				})
			},

			{
				test: /\.ess$/,
				use: [
					{
						loader: 'file',
						options: {
							name: `${output.replace(/\[hash:\d+]_/, '')}.html`
						}
					},

					'extract',

					{
						loader: 'html-loader',
						options: config.html
					},

					{
						loader: 'monic',
						options: inherit(config.monic().html, {
							replacers: [
								include('build/html-import.replacer')
							]
						})
					},

					{
						loader: 'snakeskin',
						options: inherit(config.snakeskin().server, {
							exec: true,
							data: {
								fatHTML: config.pack.fatHTML,
								root: src.cwd(),
								output: src.clientOutput(),
								favicons: config.favicons().path,
								dependencies: build.dependencies,
								assets: src.assets(),
								lib: src.lib(),
								assetsJSON,
								hashLength
							}
						})
					}
				]
			}
		);
	}

	loaders.rules.push(
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
			test: /\.(?:png|gif|jpe?g|ttf|eot|woff|woff2|mp3|ogg|aac)$/,
			use: [
				{
					loader: 'url',
					options: inherit({name: hash('[path][hash]_[name].[ext]')}, {
						limit: config.pack.dataURILimit()
					})
				}
			].concat(
				isProd ? {
					loader: 'image-webpack',
					options: config.imageOpts
				} : []
			)
		},

		{
			test: /\.svg$/,
			use: [
				{
					loader: 'svg-url',
					options: inherit({name: hash('[path][hash]_[name].[ext]')}, {
						limit: config.pack.dataURILimit()
					})
				}
			].concat(
				isProd ? {
					loader: 'svgo',
					options: config.imageOpts.svgo
				} : []
			)
		}
	);

	return loaders;
};
