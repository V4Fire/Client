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
	MiniCssExtractPlugin = require('mini-css-extract-plugin');

const
	{webpack} = config,
	{resolve} = require('@pzlr/build-core'),
	{output, assetsOutput, inherit, depsRgxpStr, hash, hashRgxp} = include('build/build.webpack');

const
	path = require('upath'),
	build = include('build/entities.webpack'),
	depsRgxp = new RegExp(`(?:^|[\\/])node_modules[\\/](?:(?!${depsRgxpStr}).)*?(?:[\\/]|$)`);

const
	snakeskin = config.snakeskin(),
	typescript = config.typescript(),
	monic = config.monic(),
	imageOpts = config.imageOpts();

const fileLoaderOpts = {
	name: path.basename(assetsOutput),
	outputPath: path.dirname(assetsOutput),
	limit: webpack.dataURILimit()
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
			test: /^(?:(?![\\/]workers[\\/]).)*(?:\.d)?\.ts$/,
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

				'typograf',
				'prelude',

				{
					loader: 'monic',
					options: inherit(monic.typescript, {
						replacers: [
							include('build/replacers/context'),
							include('build/replacers/super'),
							include('build/replacers/ts-import'),
							include('build/replacers/tests')
						]
					})
				}
			]
		});

		loaders.rules.set('ts.workers', {
			test: /[\\/]workers[\\/].*?(?:\.d)?\.ts$/,
			exclude: depsRgxp,
			use: [
				{
					loader: 'ts',
					options: typescript.worker
				},

				'typograf',
				'prelude',

				{
					loader: 'monic',
					options: inherit(monic.typescript, {
						replacers: [
							include('build/replacers/context'),
							include('build/replacers/super'),
							include('build/replacers/ts-import')
						]
					})
				}
			]
		});

		loaders.rules.set('js', {
			test: /\.js$/,
			exclude: depsRgxp,
			use: [
				'prelude',

				{
					loader: 'monic',
					options: inherit(monic.javascript, {
						replacers: [
							include('build/replacers/context'),
							include('build/replacers/super')
						]
					})
				}
			]
		});

	} else {
		loaders.rules.set('js', {
			test: /\.js$/,
			use: [
				{
					loader: 'monic',
					options: inherit(monic.javascript)
				}
			]
		});

		plugins.set('extractCSS', new MiniCssExtractPlugin({
			filename: `${hash(output, true)}.css`,
			chunkFilename: '[id].css'
		}));

		loaders.rules.set('styl', {
			test: /\.styl$/,
			use: [].concat(
				MiniCssExtractPlugin.loader,

				{
					loader: 'fast-css',
					options: Object.reject(config.css(), ['minimize'])
				},

				{
					loader: 'postcss',
					options: inherit(config.postcss(), {
						plugins: [require('autoprefixer')(config.autoprefixer())]
					})
				},

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
							require('@pzlr/stylus-inheritance')({resolveImports: true}),
							include('build/replacers/project-name')
						]
					})
				}
			)
		});

		loaders.rules.set('ess', {
			test: /\.ess$/,
			use: [
				{
					loader: 'file',
					options: {
						name: `${output.replace(hashRgxp, '')}.html`
					}
				},

				'extract',

				{
					loader: 'html',
					options: config.html()
				},

				{
					loader: 'monic',
					options: inherit(monic.html, {
						replacers: [
							include('build/replacers/html-import')
						]
					})
				},

				{
					loader: 'snakeskin',
					options: inherit(snakeskin.server, {
						exec: true,
						vars: {
							dependencies: graph.dependencies
						}
					})
				}
			]
		});
	}

	loaders.rules.set('ss', {
		test: /\.ss$/,
		use: [
			'prelude',

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
				options: imageOpts
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
				options: imageOpts.svgo
			} : []
		)
	});

	return loaders;
};
