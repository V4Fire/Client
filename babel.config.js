/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

'use strict';

module.exports = {
	sourceType: 'unambiguous',
	presets: [
		['@babel/preset-typescript'],
		['@babel/preset-env']
	],
	plugins: [
		'@babel/transform-runtime',
		['@babel/plugin-proposal-decorators', {legacy: true}],
		'@babel/plugin-proposal-class-properties'
	]
};
