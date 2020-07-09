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
	path = require('upath'),
	build = include('build/entries.webpack');

const
	{webpack} = config,
	{resolve} = require('@pzlr/build-core'),
	{isExternalDep} = include('build/const'),
	{output, assetsOutput, inherit, hash, hashRgxp} = include('build/build.webpack');

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
 * Returns options for WebPack ".module"
 *
 * @param {!Map} plugins - list of plugins
 * @returns {!Promise<Object>}
 */
module.exports = async function module({plugins}) {
	const
		graph = await build,
		loaders = {rules: new Map()};

	const
		workers = /[\\/]workers[\\/].*?(?:\.d)?\.ts$/,
		notWorkers = /^(?:(?![\\/]workers[\\/]).)*(?:\.d)?\.ts$/;

	loaders.rules.set('ts', {
		test: notWorkers,
		exclude: isExternalDep,
		use: [
			{
				loader: 'ts',
				options: typescript.client
			},

			{
				loader: 'symbol-generator',
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
						include('build/replacers/require-context'),
						include('build/replacers/super-import'),
						include('build/replacers/ts-import'),
						include('build/replacers/require-tests')
					]
				})
			}
		]
	});

	loaders.rules.set('ts.workers', {
		test: workers,
		exclude: isExternalDep,
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
						include('build/replacers/require-context'),
						include('build/replacers/super-import'),
						include('build/replacers/ts-import')
					]
				})
			}
		]
	});

	loaders.rules.set('js', {
		test: /\.js$/,
		exclude: isExternalDep,
		use: [
			'prelude',

			{
				loader: 'monic',
				options: inherit(monic.javascript, {
					replacers: [
						include('build/replacers/require-context'),
						include('build/replacers/super-import')
					]
				})
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
					replacers: [include('build/replacers/raw-import')]
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
			isProd ?
				{loader: 'image-webpack', options: Object.reject(imageOpts, ['webp'])} :
				[]
		)
	});

	loaders.rules.set('img.webp', {
		test: /\.webp$/,
		use: [
			{
				loader: 'url',
				options: fileLoaderOpts
			}
		].concat(
			isProd ?
				{loader: 'image-webpack', options: imageOpts} :
				[]
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
			isProd ?
				{loader: 'svgo', options: imageOpts.svgo} :
				[]
		)
	});

	return loaders;
};
