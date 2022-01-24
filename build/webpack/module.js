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
	projectGraph = include('build/graph');

const
	{webpack} = config,
	{resolve} = require('@pzlr/build-core');

const
	{isExternalDep} = include('build/const'),
	{hashRgxp, hash, output, assetsOutput, inherit} = include('build/helpers');

const
	snakeskin = config.snakeskin(),
	typescript = config.typescript(),
	monic = config.monic(),
	imageOpts = config.imageOpts();

const urlLoaderOpts = {
	name: path.basename(assetsOutput),
	outputPath: path.dirname(assetsOutput),
	limit: webpack.optimize.dataURILimit(),
	encoding: true,
	esModule: false
};

const urlLoaderInlineOpts = {
	...urlLoaderOpts,
	limit: undefined
};

const
	isTSWorker = /(?:\.worker\b|[\\/]workers[\\/].*?(?:\.d)?)\.ts$/,
	isTSServiceWorker = /(?:\.service-worker\b|[\\/]service-workers[\\/].*?(?:\.d)?)\.ts$/,
	isTSSharedWorker = /(?:\.shared-worker\b|[\\/]shared-workers[\\/].*?(?:\.d)?)\.ts$/,
	isJSWorker = /(?:\.worker\b|[\\/]workers[\\/].*?)\.js$/,
	isJSServiceWorker = /(?:\.servie-worker\b|[\\/]service-workers[\\/].*?)\.js$/,
	isJSSharedWorker = /(?:\.shared-worker\b|[\\/]shared-workers[\\/].*?)\.js$/,
	isNotTSWorker = /^(?:(?!\.(?:service-|shared-)?worker\b|[\\/](?:service-|shared-)?workers[\\/]).)*(?:\.d)?\.ts$/,
	isNotJSWorker = /^(?:(?!\.(?:service-|shared-)?worker\b|[\\/](?:service-|shared-)?workers[\\/]).)*\.js$/;

/**
 * Returns options for `webpack.module`
 *
 * @param {!Map} plugins - list of plugins
 * @returns {!Promise<Object>}
 */
module.exports = async function module({plugins}) {
	const
		g = await projectGraph,
		isProd = webpack.mode() === 'production';

	const
		fatHTML = webpack.fatHTML(),
		workerOpts = config.worker();

	const loaders = {
		rules: new Map()
	};

	const tsHelperLoaders = [
		{
			loader: 'symbol-generator-loader',
			options: {
				modules: [resolve.blockSync(), resolve.sourceDir, ...resolve.rootDependencies]
			}
		},

		'prelude-loader',

		{
			loader: 'monic-loader',
			options: inherit(monic.typescript, {
				replacers: [].concat(
					fatHTML ?
						[] :
						include('build/monic/attach-component-dependencies'),

					[
						include('build/monic/require-context'),
						include('build/monic/super-import'),
						include('build/monic/ts-import'),
						include('build/monic/dynamic-component-import')
					]
				)
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
					include('build/monic/require-context'),
					include('build/monic/super-import'),
					include('build/monic/dynamic-component-import')
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

	plugins.set('extractCSS', new MiniCssExtractPlugin(inherit(config.miniCssExtractPlugin(), {
		filename: `${hash(output, true)}.css`,
		chunkFilename: '[id].css'
	})));

	const styleHelperLoaders = (isStatic) => {
		const
			useLink = /linkTag/i.test(config.style().injectType),
			usePureCSSFiles = isStatic || useLink;

		return [].concat(
			usePureCSSFiles ? MiniCssExtractPlugin.loader : [],

			[
				{
					loader: 'fast-css-loader',
					options: config.css()
				},

				{
					loader: 'postcss-loader',
					options: inherit(config.postcss(), {
						postcssOptions: {
							plugins: [].concat(
								require('autoprefixer')(config.autoprefixer()),

								webpack.mode() === 'production' && !usePureCSSFiles ?
									require('cssnano')(config.cssMinimizer().minimizerOptions) :
									[]
							)
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
			]
		);
	};

	const staticCSSFiles = [].concat(
		styleHelperLoaders(true),

		{
			loader: 'monic-loader',
			options: inherit(monic.stylus, {
				replacers: [
					require('@pzlr/stylus-inheritance')({resolveImports: true}),
					include('build/monic/project-name')
				]
			})
		}
	);

	// Load via import() functions
	const dynamicCSSFiles = [].concat(
		{
			loader: 'style-loader',
			options: config.style()
		},

		styleHelperLoaders(),

		{
			loader: 'monic-loader',
			options: inherit(monic.stylus, {
				replacers: [
					require('@pzlr/stylus-inheritance')({resolveImports: true}),
					include('build/monic/project-name'),
					include('build/monic/apply-dynamic-component-styles')
				]
			})
		}
	);

	loaders.rules.set('styl', {
		test: /\.styl$/,

		...webpack.dynamicPublicPath() ?
			{use: dynamicCSSFiles} :

			{
				oneOf: [
					{resourceQuery: /static/, use: staticCSSFiles},
					{use: dynamicCSSFiles}
				]
			}
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
						include('build/monic/include'),
						include('build/monic/dynamic-component-import')
					]
				})
			},

			{
				loader: 'snakeskin-loader',
				options: inherit(snakeskin.server, {
					exec: true,
					vars: {
						entryPoints: g.dependencies
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
					replacers: [include('build/monic/dynamic-component-import')]
				})
			},

			{
				loader: 'snakeskin-loader',
				options: snakeskin.client
			}
		]
	});

	const assetsHelperLoaders = (inline) => [
		{
			loader: 'url-loader',
			options: inline ? urlLoaderInlineOpts : urlLoaderOpts
		}
	];

	loaders.rules.set('assets', {
		test: /\.(?:ttf|eot|woff|woff2|mp3|ogg|aac)$/,

		oneOf: [
			{
				resourceQuery: /inline/,
				use: assetsHelperLoaders(true)
			},

			{use: assetsHelperLoaders()}
		]
	});

	const imgHelperLoaders = (inline) => [
		{
			loader: 'url-loader',
			options: inline ? urlLoaderInlineOpts : urlLoaderOpts
		}
	].concat(
		isProd ? {loader: 'image-webpack-loader', options: Object.reject(imageOpts, ['webp'])} : []
	);

	loaders.rules.set('img', {
		test: /\.(?:ico|png|gif|jpe?g)$/,

		oneOf: [
			{
				resourceQuery: /inline/,
				use: imgHelperLoaders(true)
			},

			{use: imgHelperLoaders()}
		]
	});

	const webpHelperLoaders = (inline) => [
		{
			loader: 'url-loader',
			options: inline ? urlLoaderInlineOpts : urlLoaderOpts
		}
	].concat(
		isProd ? {loader: 'image-webpack-loader', options: imageOpts} : []
	);

	loaders.rules.set('img.webp', {
		test: /\.webp$/,
		oneOf: [
			{
				resourceQuery: /inline/,
				use: webpHelperLoaders(true)
			},

			{use: webpHelperLoaders()}
		]
	});

	const svgHelperLoaders = (inline) => [
		{
			loader: 'svg-url-loader',
			options: inline ? urlLoaderInlineOpts : urlLoaderOpts
		},
		{
			loader: 'svg-transform-loader'
		}
	].concat(
		isProd ? {loader: 'svgo-loader', options: imageOpts.svgo} : []
	);

	loaders.rules.set('img.svg', {
		test: /\.svg(\?.*)?$/,
		oneOf: [
			{
				resourceQuery: /inline/,
				use: svgHelperLoaders(true)
			},

			{use: svgHelperLoaders()}
		]
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
