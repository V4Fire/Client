'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

require('config');

const
	$C = require('collection.js'),
	build = include('build/entries.webpack');

/**
 * Returns WebPack configuration to the specified entry
 *
 * @param entry - options for WebPack ".entry"
 * @param buildId - build id
 * @returns {!Object}
 */
async function buildFactory(entry, buildId) {
	await include('build/preconfig.webpack');

	const
		plugins = await include('build/plugins.webpack')({buildId}),
		optimization = await include('build/optimization.webpack')({buildId, plugins}),
		modules = await include('build/module.webpack')({buildId, plugins});

	if (build.STD === buildId) {
		$C(entry).set((el) => [].concat(el));
	}

	return {
		entry,
		output: await include('build/output.webpack'),

		resolve: await include('build/resolve.webpack'),
		resolveLoader: await include('build/resolve-loader.webpack'),
		externals: await include('build/externals.webpack'),

		plugins: [...plugins.values()],
		module: {...modules, rules: [...modules.rules.values()]},

		mode: isProd ? 'production' : 'development',
		optimization,
		devtool: await include('build/devtool.webpack')
	};
}

/**
 * Array of promises with WebPack configs.
 * To speed up build you can use "parallel-webpack" or similar modules.
 */
const tasks = (async () => {
	await include('build/snakeskin');

	const
		graph = await build,
		tasks = await $C(graph.processes).async.map((el, i) => buildFactory(el, i));

	globalThis.WEBPACK_CONFIG = tasks;
	return tasks;
})();

module.exports = tasks;
