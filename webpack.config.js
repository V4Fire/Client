'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

require('dotenv').config();
require('@v4fire/core/build/i18n');
require('@v4fire/core/gulpfile')();

const
	{env, argv} = process;

const
	$C = require('collection.js'),
	config = require('config'),
	pack = require('./package.json');

const
	fs = require('fs'),
	path = require('path'),
	query = require('querystring');

const
	args = require('minimist')(argv.slice(2)),
	isProdEnv = env.NODE_ENV === 'production',
	isMinifyCSS = env.MINIFY_CSS === 'true';

if (args.env) {
	env.NODE_ENV = args.env;
}

let version = '';
if (isProdEnv) {
	// FIXME
	/*if (env.VERSION) {
		version = env.VERSION;

	} else {
		const v = pack.version.split('.');
		pack.version = [v[0], v[1], Number(v[2]) + 1].join('.');
		env.VERSION = version = `${pack.version.replace(/\./g, '')}_`;
		fs.writeFileSync('./package.json', `${JSON.stringify(pack, null, 2)}\n`);
	}*/

	if (!args.fast) {
		args.fast = true;
		argv.push('--fast');
	}
}

function d(src) {
	return path.join(__dirname, src);
}

const
	output = './dist/packages/[hash]_[name]',
	assetsJSON = `./dist/packages/${version}assets.json`,
	packages = d('dist/packages'),
	lib = d('node_modules'),
	entries = d('src/entries'),
	blocks = d('src'),
	assets = d('assets'),
	appGraphCache = d('app-cache/graph');

const hashLength = 15;
function v(str, chunk) {
	/// FIXME: webpack commonChunksPlugin chunkhash bug
	/*return str.replace(/\[hash]_/g, isProdEnv ?
		chunk ? `[chunkhash:${hashLength}]_` : `[hash:${hashLength}]_` :
		''
	);*/

	return str.replace(/\[hash]_/g, isProdEnv ? `[hash:${hashLength}]_` : '');
}

const
	webpack = require('webpack'),
	HardSourceWebpackPlugin = require('hard-source-webpack-plugin'),
	ExtractTextPlugin = require('extract-text-webpack-plugin'),
	AssetsWebpackPlugin = require('assets-webpack-plugin'),
	WebpackMd5Hash = require('webpack-md5-hash');

const build = require('./build/entities.webpack')({
	entries,
	blocks,
	assetsJSON,
	output: v(output),
	cache: env.FROM_CACHE && appGraphCache
});

const tplData = Object.assign(
	{
		data: JSON.stringify({
			root: __dirname,
			version,
			lib,
			entries,
			blocks,
			assets,
			packages,
			hashLength,
			dependencies: build.dependencies
		})
	},

	config.snakeskin.server,
	{exec: true}
);

require('./build/snakeskin.webpack')(blocks);
console.log('Project graph initialized');

function buildFactory(entry, i = '00') {
	const
		base = {'0': true, '00': true}[i];

	return {
		entry,
		externals: config.externals,

		output: {
			publicPath: '/',
			path: __dirname,
			filename: v(output, true)
		},

		resolve: {
			alias: {assets},
			modules: [blocks, 'node_modules']
		},

		resolveLoader: {
			alias: {
				prop: d('./web_loaders/prop'),
				proxy: d('./web_loaders/proxy')
			}
		},

		module: {
			loaders: [
				{
					test: /\.js$/,
					loader: 'babel!prop!proxy',
					exclude: /node_modules\/(?!@v4fire)/,
				},

				{
					test: /\.styl$/,
					loader: ExtractTextPlugin.extract('style', `css${isProdEnv || isMinifyCSS ? '?minimize=true!postcss' : ''}!stylus!monic`)
				},

				{
					test: /\.ss$/,
					loader: `snakeskin?${query.stringify(config.snakeskin.client)}`
				},

				{
					test: /\.ess$/,
					loader: `file?name=${output.replace(/\[hash]_/, '')}.html!extract!html!snakeskin?${query.stringify(tplData)}`
				},

				{
					test: /\.(png|gif|jpg|svg|ttf|eot|woff|woff2|mp3|ogg|aac)/,
					loader: `url?name=${v('[path][hash]_[name].[ext]')}&limit=4096`
				}
			]
		},

		plugins: [
			new webpack.DefinePlugin(config.clientGlobals),
			new ExtractTextPlugin(`${v(output, true)}.css`),
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
					compressor: {
						warnings: false,
						keep_fnames: true
					},

					comments: false,
					mangle: false
				}),

				/* eslint-enable camelcase */
			] : [],

			isProdEnv ? [
				new WebpackMd5Hash(),
				new webpack.optimize.DedupePlugin(),
				new webpack.optimize.OccurrenceOrderPlugin()

			] : [
				new HardSourceWebpackPlugin({
					cacheDirectory: d(`app-cache/${i}/[confighash]`),
					recordsPath: d(`app-cache/${i}/[confighash]/records.json`),
					environmentHash: {files: ['yarn.lock']},
					configHash: (webpackConfig) => require('node-object-hash')().hash(webpackConfig)
				})
			]
		),

		debug: config.sourcemaps,
		postcss: [require('autoprefixer')],
		babel: $C.extend({deep: true, concatArray: true}, {}, config.babel.base, config.babel.client),
		snakeskin: Object.assign({}, config.snakeskin.base),
		monic: {
			replacers: [
				require('./build/stylus-import.replacer')(blocks),
				require('@pzlr/stylus-inheritance')
			]
		},

		stylus: {
			use: require('./build/stylus.plugins'),
			preferPathResolver: 'webpack'
		}
	};
}

module.exports = args.single ?
	buildFactory(build.entry) : $C(build.processes).map((el, i) => buildFactory(el, i));
