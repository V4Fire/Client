'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
	$C = require('collection.js');

const
	{webpack} = require('config'),
	{muteConsole, unmuteConsole} = include('build/helpers');

/**
 * Returns WebPack configuration to the specified entry
 *
 * @param {!Object} entry - options for WebPack ".entry"
 * @param {(number|string)} buildId - build id
 * @returns {!Object}
 */
async function buildFactory(entry, buildId) {
	await include('build/webpack/custom/preconfig');

	const
		name = Object.keys(entry)[0],
		plugins = await include('build/webpack/plugins')({buildId, name}),
		modules = await include('build/webpack/module')({buildId, plugins}),
		target = await include('build/webpack/target');

	const config = {
		entry: await $C(entry).parallel().map((src, name) => include('build/webpack/entry')(name, src)),
		output: await include('build/webpack/output')({buildId}),

		resolve: await include('build/webpack/resolve'),
		resolveLoader: await include('build/webpack/resolve-loader'),
		externals: await include('build/webpack/externals')({buildId}),

		module: {...modules, rules: [...modules.rules.values()]},
		plugins: [...plugins.values()],

		mode: webpack.mode(),
		name,
		optimization: await include('build/webpack/optimization')({buildId, plugins}),

		devtool: await include('build/webpack/devtool'),
		cache: await include('build/webpack/cache')({buildId}),
		watchOptions: include('build/webpack/watch-options'),
		snapshot: include('build/webpack/snapshot'),
		stats: include('build/webpack/stats'),

		...await include('build/webpack/custom/options')({buildId})
	};

	if (target != null) {
		config.target = target;
	}

	return config;
}

/**
 * Array of promises with WebPack configs.
 * To speed up build you can use "parallel-webpack" or similar modules.
 */
const tasks = (async () => {
	const
		outputJSON = process.argv.some((arg) => /^--json(?:=|$)/.test(arg));

	if (outputJSON) {
		muteConsole();
	}

	await include('build/snakeskin');

	const
		{processes} = await include('build/graph');

	const
		tasks = await $C(processes).async.map((el, i) => buildFactory(el, i));

	globalThis.WEBPACK_CONFIG = tasks;

	if (outputJSON) {
		unmuteConsole();
	}

	return tasks;
})();

module.exports = tasks;
