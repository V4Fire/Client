/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

'use strict';

const
	{urlLoaderOpts, urlLoaderInlineOpts} = include('build/webpack/module/const');

/**
 * Returns webpack rules for the assets
 *
 * @returns {import('webpack').RuleSetRule}
 */
module.exports = function assetsRules() {
	const assetsHelperLoaders = (inline) => [
		{
			loader: 'url-loader',
			options: inline ? urlLoaderInlineOpts : urlLoaderOpts
		}
	];

	return {
		test: /\.(?:ttf|eot|woff|woff2|mp3|ogg|aac)$/,

		oneOf: [
			{
				resourceQuery: /inline/,
				use: assetsHelperLoaders(true)
			},

			{use: assetsHelperLoaders()}
		]
	};
};
