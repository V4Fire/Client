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
	path = require('path'),
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
module.exports = async function wssRules() {
	const g = await projectGraph;

	return {
		test: /\.wss$/,
		use: [
			{
				loader: path.resolve('build/webpack/loaders/wc-tpl-loader/index.js'),
			},
			{
				loader: 'snakeskin-loader',
				options: inherit(snakeskin.server, {
					exec: true,
					literalBounds: [ '${', '}' ],
					attrLiteralBounds: [ '${', '}' ]
				})
			}
		]
	};
};
