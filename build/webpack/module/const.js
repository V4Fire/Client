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
	{assetsOutput} = include('build/helpers');

const
	{webpack} = config;

exports.isProd = webpack.mode() === 'production';

exports.isTsFile = /\.ts$/;

exports.isJsFile = /\.js$/;

exports.urlLoaderOpts = {
	name: path.basename(assetsOutput),
	outputPath: path.dirname(assetsOutput),
	limit: webpack.optimize.dataURILimit(),
	encoding: true,
	emitFile: !webpack.ssr,
	esModule: false
};

exports.urlLoaderInlineOpts = {
	...exports.urlLoaderOpts,
	limit: undefined
};
