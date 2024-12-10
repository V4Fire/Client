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
	projectGraph = include('build/graph');

const
	snakeskin = config.snakeskin(),
	monic = config.monic();

const
	{hashRgxp, output, inherit} = include('build/helpers');

/**
 * Returns webpack rules for the executable snakeskin files
 *
 * @returns {Promise<import('webpack').RuleSetRule>}
 */
module.exports = async function essRules() {
	const
		g = await projectGraph,
		isThirdFatHTMLMode = config.webpack.fatHTML() == 3;

	return {
		test: /\.ess$/,
		use: [
			{
				loader: 'file-loader',
				options: {
					name: `${output.replace(hashRgxp, '')}.html`
				}
			},

			...(!isThirdFatHTMLMode ?
				[
					'extract-loader',

					{
						loader: 'html-loader',
						options: config.html()
					}
				] :
				[]
			),

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
	};
};
