'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
	{webpack} = require('config');

const
	$C = require('collection.js'),
	graph = include('build/graph.webpack');

/**
 * Returns WebPack configuration to the specified entry
 *
 * @param {!Object} entry - options for WebPack ".entry"
 * @param {(number|string)} buildId - build id
 * @returns {!Object}
 */
async function buildFactory(entry, buildId) {
	await include('build/preconfig.webpack');

	const
		plugins = await include('build/plugins.webpack')({buildId}),
		modules = await include('build/module.webpack')({buildId, plugins});

	return {
		entry: await $C(entry).parallel().map((src, name) => include('build/entry.webpack')(name, src)),
		output: await include('build/output.webpack')({buildId}),
		target: await include('build/target.webpack'),

		resolve: await include('build/resolve.webpack'),
		resolveLoader: await include('build/resolve-loader.webpack'),
		externals: await include('build/externals.webpack')({buildId}),

		module: {...modules, rules: [...modules.rules.values()]},
		plugins: [...plugins.values()],

		mode: webpack.mode(),
		optimization: await include('build/optimization.webpack')({buildId, plugins}),

		devtool: await include('build/devtool.webpack'),
		cache: await include('build/cache.webpack')({buildId}),
		watchOptions: include('build/watch-options.webpack'),
		snapshot: include('build/snapshot.webpack'),

		...await include('build/other.webpack')({buildId})
	};
}

/**
 * Array of promises with WebPack configs.
 * To speed up build you can use "parallel-webpack" or similar modules.
 */
const tasks = (async () => {
	await include('build/snakeskin');

	const
		{processes} = await graph;

	const
		tasks = await $C(processes).async.map((el, i) => buildFactory(el, i));

	globalThis.WEBPACK_CONFIG = tasks;
	return tasks;
})();

module.exports = tasks;
