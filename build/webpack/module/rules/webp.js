/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

'use strict';

const
	config = require('@config/config');

const
	{isProd, urlLoaderOpts, urlLoaderInlineOpts} = include('build/webpack/module/const');

const
	imageOpts = config.imageOpts();

/**
 * Returns webpack rules for the webp images
 *
 * @returns {import('webpack').RuleSetRule}
 */
module.exports = function webpRules() {
	const webpHelperLoaders = (inline) => [
		{
			loader: 'url-loader',
			options: inline ? urlLoaderInlineOpts : urlLoaderOpts
		}
	].concat(
		isProd ? {loader: 'image-webpack-loader', options: imageOpts} : []
	);

	return {
		test: /\.webp$/,
		oneOf: [
			{
				resourceQuery: /inline/,
				use: webpHelperLoaders(true)
			},

			{use: webpHelperLoaders()}
		]
	};
};

