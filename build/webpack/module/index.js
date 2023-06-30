/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

'use strict';

const
	config = require('@config/config'),
	path = require('upath');

const
	{isTsFile, isJsFile} = include('build/webpack/module/const'),
	{assetsOutput} = include('build/helpers');

const
	rules = include('build/webpack/module/rules');

const
	{webpack} = config,
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

/**
 * @typedef {object} ModuleArgs
 * @prop {Map<string, object>} plugins - list of plugins
 */

/**
 * Returns parameters for `webpack.module`
 *
 * @param {ModuleArgs} args
 * @returns {Promise<object>}
 */
module.exports = async function module(args) {
	const
		isProd = webpack.mode() === 'production';

	const loaders = {
		rules: new Map()
	};

	loaders.rules.set('ts', await rules.typescript(args));
	loaders.rules.set('js', await rules.javascript(args));
	loaders.rules.set('styl', await rules.stylus(args));
	loaders.rules.set('ss', await rules.snakeskin(args));
	loaders.rules.set('ess', await rules.executableSnakeskin(args));

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

	function webpHelperLoaders(inline) {
		return [
			{
				loader: 'url-loader',
				options: inline ? urlLoaderInlineOpts : urlLoaderOpts
			}
		].concat(
			isProd ? {loader: 'image-webpack-loader', options: imageOpts} : []
		);
	}

	function svgHelperLoaders(inline) {
		return [
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
	}
};

Object.assign(module.exports, {
	urlLoaderOpts,
	isNotTSWorker: isTsFile,
	isNotJSWorker: isJsFile
});
