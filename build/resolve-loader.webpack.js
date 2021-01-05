'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
	$C = require('collection.js'),
	{config, resolve} = require('@pzlr/build-core');

const
	glob = require('glob'),
	path = require('path');

/**
 * Map with aliases for custom (not external) loaders from all layers
 * @type {!Object}
 */
const alias = $C([resolve.cwd, ...config.dependencies]).to({}).reduce((map, el, i) => {
	$C(glob.sync(path.join(i ? resolve.lib : '', el, 'build/loaders/*.js'))).forEach((el) => {
		const
			key = path.basename(el, path.extname(el));

		if (!map[key]) {
			map[key] = el;
		}
	});

	return map;
});

/**
 * Options for WebPack ".resolveLoader"
 * @type {{moduleExtensions: [string], alias: !Object}}
 */
module.exports = {
	alias
};
