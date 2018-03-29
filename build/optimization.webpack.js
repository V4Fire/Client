'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
	UglifyJsPlugin = require('uglifyjs-webpack-plugin');

/**
 * Returns a list of webpack optimizations
 *
 * @param {(number|string)} buildId - build id
 * @returns {Array}
 */
module.exports = async function ({buildId}) {
	const base = {
		'0': true,
		'00': true
	}[buildId];

	const
		options = {};

	if (base) {
		options.splitChunks = {
			name: 'index.js',
			chunks: 'initial'
		};
	}

	if (isProd) {
		options.minimizer = [
			/* eslint-disable camelcase */

			new UglifyJsPlugin({
				parallel: true,
				uglifyOptions: {
					compress: {
						warnings: false,
						keep_classnames: true,
						keep_fnames: true
					},

					output: {
						comments: false
					},

					mangle: false
				}
			})

			/* eslint-enable camelcase */
		];
	}

	return options;
};
