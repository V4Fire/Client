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
	{resolve} = require('@pzlr/build-core'),
	{output, assetsOutput, assetsJSON, hash, inherit, depsRgxpStr} = include('build/build.webpack');

const
	path = require('upath'),
	build = include('build/entities.webpack'),
	depsRgxp = new RegExp(`(?:^|/)node_modules/(?:(?!${depsRgxpStr}).)*?(?:/|$)`);

const
	snakeskin = config.snakeskin(),
	typescript = config.typescript(),
	monic = config.monic();

const fileLoaderOpts = {
	name: path.basename(assetsOutput),
	outputPath: path.dirname(assetsOutput),
	limit: config.webpack.dataURILimit()
};

/**
 * Returns parameters for webpack.module
 *
 * @param {(number|string)} buildId - build id
 * @param {!Map} plugins - list of plugins
 * @returns {!Promise<Object>}
 */
module.exports = async function ({buildId, plugins}) {
	const
		graph = await build,
		loaders = {rules: new Map()};

	if (buildId === build.RUNTIME) {
		loaders.rules.set('ts', {
			test: /^(?:(?!\/workers\/).)*\.ts$/,
			exclude: depsRgxp,
			use: [
				{
					loader: 'ts',
					options: typescript.client
				},

				{
					loader: 'proxy',
					options: {
						modules: [resolve.blockSync(), resolve.sourceDir, ...resolve.rootDependencies]
					}
				},

				{
					loader: 'monic',
					options: inherit(monic.typescript, {
						replacers: [
							include('build/context.replacer'),
							include('build/super.replacer'),
							include('build/ts-import.replacer'),
							include('build/typograf.replacer')
						]
					})
				}
			]
		});

		loaders.rules.set('ts.workers', {
			test: /\/workers\/.*?\.ts$/,
			exclude: depsRgxp,
			use: [
				{
					loader: 'ts',
					options: typescript.worker
				},

				{
					loader: 'monic',
					options: inherit(monic.typescript, {
						replacers: [
							include('build/context.replacer'),
							include('build/super.replacer'),
							include('build/ts-import.replacer'),
							include('build/typograf.replacer')
						]
					})
				}
			]
		});

		loaders.rules.set('js', {
			test: /\.js$/,
			exclude: depsRgxp,
			use: [{
				loader: 'monic',
				options: inherit(monic.javascript, {
					replacers: [
						include('build/context.replacer'),
						include('build/super.replacer'),
						include('build/typograf.replacer')
					]
				})
			}]
		});

	} else {
		plugins.set(
			'extractCSS',
			new ExtractTextPlugin(`${hash(output, true)}.css`)
		);

		loaders.rules.set('styl', {
			test: /\.styl$/,
			use: ExtractTextPlugin.extract({
				fallback: 'style',
				use: [].concat(
					{
						loader: 'css',
						options: config.css()
					},

					isProd || $C(config.postcss).length() || $C(config.autoprefixer).length() ? {
						loader: 'postcss',
						options: inherit(config.postcss, {
							plugins: [require('autoprefixer')(config.autoprefixer)]
						})
					} : [],

					{
						loader: 'stylus',
						options: inherit(config.stylus(), {
							use: include('build/stylus')
						})
					},

					{
						loader: 'monic',
						options: inherit(monic.stylus, {
							replacers: [
								require('@pzlr/stylus-inheritance')({resolveImports: true})
							]
						})
					}
				)
			})
		});

		loaders.rules.set('ess', {
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
					options: inherit(monic.html, {
						replacers: [
							include('build/html-import.replacer')
						]
					})
				},

				{
					loader: 'snakeskin',
					options: inherit(snakeskin.server, {
						exec: true,
						vars: {
							dependencies: graph.dependencies,
							assetsJSON
						}
					})
				}
			]
		});
	}

	loaders.rules.set('ss', {
		test: /\.ss$/,
		use: [
			{
				loader: 'snakeskin',
				options: snakeskin.client
			}
		]
	});

	loaders.rules.set('assets', {
		test: /\.(?:ttf|eot|woff|woff2|mp3|ogg|aac)$/,
		use: [
			{
				loader: 'url',
				options: fileLoaderOpts
			}
		]
	});

	loaders.rules.set('img', {
		test: /\.(?:png|gif|jpe?g)$/,
		use: [
			{
				loader: 'url',
				options: fileLoaderOpts
			}
		].concat(
			isProd ? {
				loader: 'image-webpack',
				options: config.imageOpts
			} : []
		)
	});

	loaders.rules.set('img.svg', {
		test: /\.svg$/,
		use: [
			{
				loader: 'svg-url',
				options: fileLoaderOpts
			}
		].concat(
			isProd ? {
				loader: 'svgo',
				options: config.imageOpts.svgo
			} : []
		)
	});

	return loaders;
};
