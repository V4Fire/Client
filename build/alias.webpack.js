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
const aliases = {
	'@super': resolve.rootDependencies[0],
	...$C(pzlr.dependencies).to({}).reduce((map, el, i) => {
		const
			a = resolve.depMap[el].config.assets;

		if (!a || !a.sprite) {
			return map;
		}

		map[`${el}/sprite`] = path.join(resolve.rootDependencies[i], a.dir, a.sprite);
		return map;
	})
};

if (pzlr.assets && pzlr.assets.sprite) {
	aliases.sprite = src.assets(pzlr.assets.sprite);
}

module.exports = aliases;
