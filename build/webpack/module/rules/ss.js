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
	snakeskin = config.snakeskin(),
	swcOptions = config.webpack.swc(),
	monic = config.monic();

const
	{inherit} = include('build/helpers');

/**
 * Returns webpack rules for the snakeskin files
 *
 * @returns {import('webpack').RuleSetRule}
 */
module.exports = function ssRules() {
	return {
		test: /\.ss$/,
		use: [
			{
				loader: 'swc-loader',
				options: swcOptions.ss
			},
			{
				loader: 'monic-loader',
				options: inherit(monic.javascript, {
					replacers: [
						// NOTE: it would be better to convert `factory(exports)` to `factory(module.exports)`
						// but for some reason compiled snakeskin is threated as ESM module
						// @see https://github.com/V4Fire/Client/issues/1410
						(text) => text.replace('if (typeof exports === "object" && typeof module !== "undefined") {factory(exports)', 'if (true) {factory(typeof exports === \'undefined\' ? __webpack_exports__ : exports)'),
						include('build/monic/dynamic-component-import')
					]
				})
			},

			{
				loader: 'snakeskin-loader',
				options: snakeskin.client
			}
		]
	};
};
