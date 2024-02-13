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
	'@super': resolve.rootDependencies[0],

	// This is required for using jest-mock,
	// otherwise jest-mock pulls various Node.js modules into the browser environment.
	'graceful-fs': false,
	path: false,
	picomatch: false,
	url: false,
	process: false,
	os: false,
	tty: false,

	...$C(pzlr.dependencies).to({}).reduce((map, el, i) => {
		const
			asset = resolve.depMap[el].config.assets;

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
