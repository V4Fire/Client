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

const alias = $C([resolve.cwd, ...config.dependencies]).to({}).reduce((map, el) => {
	$C(glob.sync(path.join(resolve.lib, el, 'build/loaders/*.js'))).forEach((el) => {
		map[path.basename(el, path.extname(el))] = el;
	});

	return map;
});

module.exports = {
	moduleExtensions: ['-loader'],
	alias
};
