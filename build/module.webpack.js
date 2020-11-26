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
	build = include('build/graph.webpack');

const
	{webpack} = config,
	{resolve} = require('@pzlr/build-core'),
	{isExternalDep} = include('build/const'),
	{output, assetsOutput, inherit, hash, hashRgxp} = include('build/helpers.webpack');

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
		isProd = webpack.mode() === 'production';

	const
		graph = await build,
		loaders = {rules: new Map()};

	const
		workerOpts = config.worker();

	const tsHelperLoaders = [
		{
			loader: 'symbol-generator-loader',
			options: {
				modules: [resolve.blockSync(), resolve.sourceDir, ...resolve.rootDependencies]
			}
		},

		'typograf-loader',
		'prelude-loader',

		{
			loader: 'monic-loader',
			options: inherit(monic.typescript, {
				replacers: [
					include('build/replacers/attach-component-dependencies'),
					include('build/replacers/require-context'),
					include('build/replacers/super-import'),
					include('build/replacers/ts-import'),
					include('build/replacers/dynamic-component-import'),
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
				loader: 'ts-loader',
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
				loader: 'worker-loader',
				options: workerOpts.worker
			},

			{
				loader: 'ts-loader',
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
				loader: 'worker-loader',
				options: workerOpts.serviceWorker
			},

			{
				loader: 'ts-loader',
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
				loader: 'worker-loader',
				options: workerOpts.sharedWorker
			},

			{
				loader: 'ts-loader',
				options: typescript.worker
			},

			...tsHelperLoaders
		]
	});

	const jsHelperLoaders = [
		'prelude-loader',

		{
			loader: 'monic-loader',
			options: inherit(monic.javascript, {
				replacers: [
					include('build/replacers/require-context'),
					include('build/replacers/super-import'),
					include('build/replacers/dynamic-component-import'),
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
				loader: 'worker-loader',
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
				loader: 'worker-loader',
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
				loader: 'worker-loader',
				options: workerOpts.sharedWorker
			},

			...jsHelperLoaders
		]
	});

	plugins.set('extractCSS', new MiniCssExtractPlugin({
		filename: `${hash(output, true)}.css`,
		chunkFilename: '[id].css'
	}));

	const stylHelperLoaders = [
		{
			loader: 'fast-css-loader',
			options: Object.reject(config.css(), ['minimize'])
		},

		{
			loader: 'postcss-loader',
			options: inherit(config.postcss(), {
				postcssOptions: {
					plugins: [require('autoprefixer')(config.autoprefixer())]
				}
			})
		},

		{
			loader: 'stylus-loader',
			options: inherit(config.stylus(), {
				stylusOptions: {
					use: include('build/stylus')
				}
			})
		}
	];

	loaders.rules.set('styl', {
		test: /\.styl$/,

		oneOf: [
			{
				resourceQuery: /dynamic/,
				use: [].concat(
					'style-loader',
					stylHelperLoaders,

					{
						loader: 'monic-loader',
						options: inherit(monic.stylus, {
							replacers: [
								require('@pzlr/stylus-inheritance')({resolveImports: true}),
								include('build/replacers/project-name'),
								include('build/replacers/apply-dynamic-component-styles')
							]
						})
					}
				)
			},

			{
				use: [].concat(
					MiniCssExtractPlugin.loader,
					stylHelperLoaders,

					{
						loader: 'monic-loader',
						options: inherit(monic.stylus, {
							replacers: [
								require('@pzlr/stylus-inheritance')({resolveImports: true}),
								include('build/replacers/project-name')
							]
						})
					}
				)
			}
		]
	});

	loaders.rules.set('ess', {
		test: /\.ess$/,
		use: [
			{
				loader: 'file-loader',
				options: {
					name: `${output.replace(hashRgxp, '')}.html`
				}
			},

			'extract-loader',

			{
				loader: 'html-loader',
				options: config.html()
			},

			{
				loader: 'monic-loader',
				options: inherit(monic.html, {
					replacers: [
						include('build/replacers/include'),
						include('build/replacers/dynamic-component-import')
					]
				})
			},

			{
				loader: 'snakeskin-loader',
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
			'prelude-loader',

			{
				loader: 'monic-loader',
				options: inherit(monic.javascript, {
					replacers: [include('build/replacers/dynamic-component-import')]
				})
			},

			{
				loader: 'snakeskin-loader',
				options: snakeskin.client
			}
		]
	});

	loaders.rules.set('assets', {
		test: /\.(?:ttf|eot|woff|woff2|mp3|ogg|aac)$/,
		use: [
			{
				loader: 'url-loader',
				options: urlLoaderOpts
			}
		]
	});

	loaders.rules.set('img', {
		test: /\.(?:ico|png|gif|jpe?g)$/,
		use: [
			{
				loader: 'url-loader',
				options: urlLoaderOpts
			}
		].concat(
			isProd ?
				{loader: 'image-webpack-loader', options: Object.reject(imageOpts, ['webp'])} :
				[]
		)
	});

	loaders.rules.set('img.webp', {
		test: /\.webp$/,
		use: [
			{
				loader: 'url-loader',
				options: urlLoaderOpts
			}
		].concat(
			isProd ?
				{loader: 'image-webpack-loader', options: imageOpts} :
				[]
		)
	});

	loaders.rules.set('img.svg', {
		test: /\.svg$/,
		use: [
			{
				loader: 'svg-url-loader',
				options: urlLoaderOpts
			}
		].concat(
			isProd ?
				{loader: 'svgo-loader', options: imageOpts.svgo} :
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
