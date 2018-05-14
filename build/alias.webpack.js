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
	path = require('path');

const
	{config: pzlr, resolve} = require('@pzlr/build-core'),
	{src} = require('config');

/**
 * Parameters for webpack.alias
 */
module.exports = {
	'@super': resolve.rootDependencies[0],
	'sprite': src.assets(pzlr.assets.sprite),
	...$C(pzlr.dependencies).to({}).reduce((map, el, i) => {
		const a = resolve.depMap[el].config.assets;
		map[`${el}/sprite`] = path.join(resolve.rootDependencies[i], a.dir, a.sprite);
		return map;
	})
};
