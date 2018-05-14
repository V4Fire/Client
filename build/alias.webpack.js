'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
	{resolve} = require('@pzlr/build-core'),
	{src} = require('config');

/**
 * Parameters for webpack.alias
 */
module.exports = {
	'@super': resolve.rootDependencies[0],
	'sprite': src.assets('svg')
};
