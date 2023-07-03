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
 * Returns webpack rules for the svg images
 *
 * @returns {import('webpack').RuleSetRule}
 */
module.exports = function imagesSvgRules() {
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

	return {
		test: /\.svg(\?.*)?$/,
		oneOf: [
			{
				resourceQuery: /inline/,
				use: svgHelperLoaders(true)
			},

			{use: svgHelperLoaders()}
		]
	};
};
