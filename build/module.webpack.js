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

const urlLoaderOpts = {
	name: path.basename(assetsOutput),
	outputPath: path.dirname(assetsOutput),
	limit: webpack.dataURILimit(),
	encoding: true,
	esModule: false
};

const
	isTSWorker = /(?:\.worker\b|[\\/]workers[\\/].*?(?:\.d)?)\.ts$/,
	isTSServiceWorker = /(?:\.service-worker\b|[\\/]service-workers[\\/].*?(?:\.d)?)\.ts$/,
	isTSSharedWorker = /(?:\.shared-worker\b|[\\/]shared-workers[\\/].*?(?:\.d)?)\.ts$/,
	isJSWorker = /(?:\.worker\b|[\\/]workers[\\/].*?)\.js$/,
	isJSServiceWorker = /(?:\.servie-worker\b|[\\/]service-workers[\\/].*?)\.js$/,
	isJSSharedWorker = /(?:\.shared-worker\b|[\\/]shared-workers[\\/].*?)\.js$/,
	isNotTSWorker = /^(?:(?!(?:\.(?:service-|shared-)?worker\b|[\\/](?:service-|shared-)?workers[\\/])).)*(?:\.d)?\.ts$/,
	isNotJSWorker = /^(?:(?!(?:\.(?:service-|shared-)?worker\b|[\\/](?:service-|shared-)?workers[\\/])).)*\.js$/;

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
		workerOpts = config.worker();

	const tsHelperLoaders = [
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
	];

	loaders.rules.set('ts', {
		test: isNotTSWorker,
		exclude: isExternalDep,
		use: [
			{
				loader: 'ts',
				options: typescript.client
			},

			...tsHelperLoaders
		]
	});

	loaders.rules.set('ts.workers', {
		test: isTSWorker,
		exclude: isExternalDep,
		use: [
			{
				loader: 'worker',
				options: workerOpts.worker
			},

			{
				loader: 'ts',
				options: typescript.worker
			},

			...tsHelperLoaders
		]
	});

	loaders.rules.set('ts.serviceWorkers', {
		test: isTSServiceWorker,
		exclude: isExternalDep,
		use: [
			{
				loader: 'worker',
				options: workerOpts.serviceWorker
			},

			{
				loader: 'ts',
				options: typescript.worker
			},

			...tsHelperLoaders
		]
	});

	loaders.rules.set('ts.sharedWorkers', {
		test: isTSSharedWorker,
		exclude: isExternalDep,
		use: [
			{
				loader: 'worker',
				options: workerOpts.sharedWorker
			},

			{
				loader: 'ts',
				options: typescript.worker
			},

			...tsHelperLoaders
		]
	});

	const jsHelperLoaders = [
		'prelude',

		{
			loader: 'monic',
			options: inherit(monic.javascript, {
				replacers: [
					include('build/replacers/require-context'),
					include('build/replacers/super-import'),
					include('build/replacers/require-tests')
				]
			})
		}
	];

	loaders.rules.set('js', {
		test: isNotJSWorker,
		exclude: isExternalDep,
		use: jsHelperLoaders
	});

	loaders.rules.set('js.workers', {
		test: isJSWorker,
		exclude: isExternalDep,
		use: [
			{
				loader: 'worker',
				options: workerOpts.worker
			},

			...jsHelperLoaders
		]
	});

	loaders.rules.set('js.serviceWorkers', {
		test: isJSServiceWorker,
		exclude: isExternalDep,
		use: [
			{
				loader: 'worker',
				options: workerOpts.serviceWorker
			},

			...jsHelperLoaders
		]
	});

	loaders.rules.set('js.sharedWorkers', {
		test: isJSSharedWorker,
		exclude: isExternalDep,
		use: [
			{
				loader: 'worker',
				options: workerOpts.sharedWorker
			},

			...jsHelperLoaders
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
					postcssOptions: {
						plugins: [
							[
								'autoprefixer',
								config.autoprefixer()
							]
						]
					}
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
					replacers: [include('build/replacers/include')]
				})
			},

			{
				loader: 'snakeskin',
				options: inherit(snakeskin.server, {
					exec: true,
					vars: {
						entryPoints: graph.dependencies
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
				options: urlLoaderOpts
			}
		]
	});

	loaders.rules.set('img', {
		test: /\.(?:ico|png|gif|jpe?g)$/,
		use: [
			{
				loader: 'url',
				options: urlLoaderOpts
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
				options: urlLoaderOpts
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
				options: urlLoaderOpts
			}
		].concat(
			isProd ?
				{loader: 'svgo', options: imageOpts.svgo} :
				[]
		)
	});

	return loaders;
};

Object.assign(module.exports, {
	urlLoaderOpts,
	isTSWorker,
	isTSServiceWorker,
	isTSSharedWorker,
	isJSWorker,
	isJSServiceWorker,
	isJSSharedWorker,
	isNotTSWorker,
	isNotJSWorker
});
