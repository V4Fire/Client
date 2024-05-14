/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

'use strict';

const
	{src, webpack} = require('@config/config'),
	{hash, output: outputPattern} = include('build/helpers');

/**
 * Returns parameters for `webpack.output`
 *
 * @param {(number|string)} buildId
 * @returns {object}
 */
module.exports = function output({buildId}) {
	const params = {
		path: src.clientOutput(),
		publicPath: webpack.publicPath(),

		filename: `${hash(outputPattern, true)}.js`,
		chunkFilename: `${hash(outputPattern, true)}.js`,
		uniqueName: `v4fire-${buildId}`
	};

	if (webpack.ssr) {
		Object.assign(params, {
			libraryTarget: 'commonjs2',
			chunkLoading: 'require',
			chunkFormat: 'commonjs',
			filename: '[name].js'
		});

	} else {
		Object.assign(params, {
			chunkLoading: 'jsonp',
			chunkFormat: 'array-push',
			hashFunction: webpack.hashFunction(),
			crossOriginLoading: 'anonymous'
		});
	}

	return params;
};
