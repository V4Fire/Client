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
	{src, webpack} = require('@config/config'),
	{config: pzlr, resolve} = require('@pzlr/build-core');

/**
 * Options for `webpack.alias`
 */
const aliases = {
	...$C(pzlr.dependencies).to({}).reduce((map, el, i) => {
		const
			asset = resolve.depMap[el].config.assets;

		map[el] = path.resolve('node_modules', el, 'src');

		if (asset?.sprite == null) {
			return map;
		}

		map[`${el}/sprite`] = path.join(resolve.rootDependencies[i], asset.dir, asset.sprite);
		return map;
	}),

	...webpack.aliases()
};

if (pzlr.designSystem != null) {
	aliases.ds = pzlr.designSystem;
}

if (pzlr.assets?.sprite != null) {
	aliases.sprite = src.assets(pzlr.assets.sprite);
}

module.exports = aliases;
