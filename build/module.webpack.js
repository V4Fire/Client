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
	{resolve, config: {dependencies}} = require('@pzlr/build-core'),
	{output, hash, version, hashLength} = include('build/build.webpack');

const
	depsRgxp = new RegExp(`node_modules\\/(?!${dependencies.map((el) => RegExp.escape(el || el.src)).join('|')})`);

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
				test: /\.ts/,
				exclude: depsRgxp,
				use: [
					{
						loader: 'ts',
						options: {
							transpileOnly: !isProd
						}
					},

					{
						loader: 'proxy',
						options: {
							modules: [resolve.blockSync(), resolve.sourceDir, ...resolve.rootDependencies]
						}
					},

					{
						loader: 'monic',
						options: $C.extend({deep: true, concatArray: true}, {}, config.monic().ts, {
							replacers: [
								include('build/ts-import.replacer')
							]
						})
					}
				]
			},

			{
				test: /workers\/\w+\.ts$/,
				exclude: depsRgxp,
				use: [{loader: 'ts'}]
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
							options: $C.extend({deep: true, concatArray: true}, {}, config.monic().styl, {
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
	);

	return loaders;
};
