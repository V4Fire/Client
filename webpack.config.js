'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

require('@v4fire/core/build/i18n');

const
	$C = require('collection.js'),
	path = require('path'),
	config = require('config');

const
	{d, hash, args, cwd, VERSION, HASH_LENGTH} = require('./build/helpers.webpack'),
	{env} = process;

const
	isProdEnv = env.NODE_ENV === 'production',
	isMinifyCSS = env.MINIFY_CSS === 'true';

const
	webpack = require('webpack'),
	HardSourceWebpackPlugin = require('hard-source-webpack-plugin'),
	ExtractTextPlugin = require('extract-text-webpack-plugin'),
	AssetsWebpackPlugin = require('assets-webpack-plugin'),
	WebpackMd5Hash = require('webpack-md5-hash');

const
	output = './dist/packages/[hash]_[name]',
	assetsJSON = `./dist/packages/${VERSION}assets.json`;

const
	blocks = d('src'),
	entries = d('src/entries'),
	assets = d('assets'),
	lib = d('node_modules');

const build = require('./build/entities.webpack')({
	output: hash(output),
	cache: env.FROM_CACHE && d('app-cache/graph'),
	assetsJSON,
	entries,
	blocks,
	lib
});

require('./build/snakeskin.webpack')({blocks, lib});
console.log('Project graph initialized');

function buildFactory(entry, i = '00') {
	const
		base = {'0': true, '00': true}[i];

	return {
		entry,
		externals: config.externals,

		output: {
			path: cwd,
			publicPath: '/',
			filename: hash(output, true)
		},

		resolve: {
			alias: {assets},
			modules: [blocks, 'node_modules']
		},

		resolveLoader: {
			moduleExtensions: ['-loader'],
			alias: {
				prop: path.join(__dirname, './web_loaders/prop'),
				proxy: path.join(__dirname, './web_loaders/proxy')
			}
		},

		plugins: [
			new webpack.DefinePlugin(config.globals),
			new ExtractTextPlugin(`${hash(output, true)}.css`),
			new AssetsWebpackPlugin({filename: assetsJSON, update: true})

		].concat(
			base ? new webpack.optimize.CommonsChunkPlugin({
				name: 'index.js',
				chunks: $C(Object.keys(build.entry)).get((el) => /^[^$]+\.js$/.test(el)),
				minChunks: 2,
				async: false
			}) : [],

			isProdEnv && !env.DEBUG ? [
				/* eslint-disable camelcase */

				new webpack.optimize.UglifyJsPlugin({
					compress: {
						warnings: false,
						keep_fnames: true
					},

					output: {
						comments: false
					},

					mangle: false
				}),

				/* eslint-enable camelcase */

				new webpack.LoaderOptionsPlugin({
					minimize: true,
					debug: false,
					options: {
						context: __dirname
					}
				})
			] : [],

			isProdEnv ? [
				new WebpackMd5Hash()

			] : [
				new HardSourceWebpackPlugin({
					cacheDirectory: d(`app-cache/${i}/[confighash]`),
					recordsPath: d(`app-cache/${i}/[confighash]/records.json`),
					environmentHash: {files: ['yarn.lock']},
					configHash: (webpackConfig) => require('node-object-hash')().hash(webpackConfig)
				})
			]
		),

		module: {
			rules: [
				{
					test: /\.js$/,
					exclude: /node_modules\/(?!@v4fire)/,
					use: [
						{
							loader: 'babel',
							options: config.babel.base
						},

						'prop',
						'proxy'
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
									minimize: Boolean(isProdEnv || isMinifyCSS)
								}
							},

							isProdEnv ? [
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
									use: require('./build/stylus.plugins'),
									preferPathResolver: 'webpack'
								}
							},

							{
								loader: 'monic',
								options: {
									replacers: [
										require('./build/stylus-import.replacer'),
										require('@pzlr/stylus-inheritance')
									]
								}
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
								data: JSON.stringify({
									root: cwd,
									version: VERSION,
									hashLength: HASH_LENGTH,
									dependencies: build.dependencies,
									packages: d('dist/packages'),
									assets,
									lib
								})
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
		}
	};
}

module.exports = args.single ?
	buildFactory(build.entry) : $C(build.processes).map((el, i) => buildFactory(el, i));
