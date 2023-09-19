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
	path = require('path');

const
	{isProd, urlLoaderOpts, urlLoaderInlineOpts} = include('build/webpack/module/const');

const
	imageOpts = config.imageOpts();

/**
 * Returns webpack rules for the images
 *
 * @returns {import('webpack').RuleSetRule}
 */
module.exports = function imagesRules() {
	const imgHelperLoaders = (inline) => [
		{
			loader: 'url-loader',
			options: inline ? urlLoaderInlineOpts : urlLoaderOpts
		}
	].concat(
		isProd ? {loader: 'image-webpack-loader', options: Object.reject(imageOpts, ['webp'])} : []
	);

	return {
		test: /\.(?:ico|png|gif|jpe?g)$/,

		oneOf: [
			{
				resourceQuery: /inline/,
				use: imgHelperLoaders(true)
			},

			{
				resourceQuery: /responsive/,
				use: [
					{
						loader: path.resolve('build', 'webpack', 'loaders', 'responsive-images-loader'),
						options: config.responsiveImagesOpts()
					}
				]
			},

			{use: imgHelperLoaders()}
		]
	};
};
