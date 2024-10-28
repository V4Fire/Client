/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

'use strict';

const
	$C = require('collection.js'),
	{config, resolve} = require('@pzlr/build-core');

const
	glob = require('fast-glob'),
	path = require('upath');

/**
 * Map with aliases for custom (not external) loaders from all layers
 * @type {object}
 */
const alias = $C([resolve.cwd, ...config.dependencies]).to({}).reduce((loaders, el, i) => {
	const loaderPaths = [].concat(
		glob.sync(path.join(i ? resolve.lib : '', el, 'build/webpack/loaders/*.js')),
		glob.sync(path.join(i ? resolve.lib : '', el, 'build/webpack/loaders/*/index.js'))
	);

	$C(loaderPaths).forEach((loaderPath) => {
		const
			chunks = loaderPath.split(path.sep),
			loaderName = chunks[chunks.length - 2];

		if (!loaders[loaderName]) {
			loaders[loaderName] = loaderPath;
		}
	});

	return loaders;
});

/**
 * Array with paths to resolve nested loaders from `node_modules`
 * @type {Array}
 */
const modules = ['node_modules', ...resolve.rootDependencies.map((el) => `${path.parse(el).dir}/node_modules`)];

/**
 * Options for `webpack.resolveLoader`
 * @type {{moduleExtensions: [string], alias: !Object}}
 */
module.exports = {
	alias,
	modules
};
