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
	// MiniCssExtractPlugin = require('mini-css-extract-plugin');

const
	{webpack} = config,
	monic = config.monic();

const
	{inherit} = include('build/helpers');

const
	isStylFile = /\.styl$/;

/**
 * Returns webpack rules for the stylus files
 *
 * @param {import('../index').ModuleArgs} args
 * @returns {import('webpack').RuleSetRule}
 */
module.exports = function stylRules() {
	// FIXME: fails in rspack
	// plugins.set('extractCSS', new MiniCssExtractPlugin(inherit(config.miniCssExtractPlugin(), {
	// 	filename: `${hash(output, true)}.css`,
	// 	chunkFilename: '[id].css'
	// })));

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
		webpack.ssr ?
			{loader: 'to-string-loader'} :
			{loader: 'style-loader', options: config.style()},

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

	return {
		test: isStylFile,

		...webpack.dynamicPublicPath() ?
			{use: dynamicCSSFiles} :

			{
				oneOf: [
					{resourceQuery: /static/, use: staticCSSFiles},
					{use: dynamicCSSFiles}
				]
			}
	};
};

/**
 * Returns helper loaders for styles
 *
 * @param {boolean} isStatic
 * @returns {Array<import('webpack').RuleSetRuleItem | string>}
 */
function styleHelperLoaders(isStatic = false) {
	const
		useLink = /link[Tt]ag/.test(config.style().injectType),
		usePureCSSFiles = isStatic || useLink;

	return [].concat(
		// FIXME: fails without mini css extract plugin
		// usePureCSSFiles ? MiniCssExtractPlugin.loader : [],

		[
			{
				loader: 'css-loader',
				options: {
					...config.css(),
					importLoaders: 1
				}
			},

			'svg-transform-loader/encode-query',

			{
				loader: 'postcss-loader',
				options: inherit(config.postcss(), {
					postcssOptions: {
						plugins: [].concat(
							require('autoprefixer')(config.autoprefixer()),
							require('postcss-discard-comments')(),

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
}
