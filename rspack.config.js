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
	{webpack, build} = require('@config/config');

const
	{tracer} = include('build/helpers/tracer'),
	{wrapLoaders} = include('build/webpack/loaders/measure-loader');

/**
 * Returns WebPack configuration for the specified entry
 *
 * @param {object} entry - parameters from `webpack.entry`
 * @param {(number|string)} buildId
 * @returns {object}
 */
async function buildFactory(entry, buildId) {
	await include('build/webpack/custom/preconfig');

	const {
		name,
		entries,
		dependencies
	} = entry;

	const webpackEntry = await $C(entries)
		.parallel()
		.map((src, name) => include('build/webpack/entry')(name, src));

	const
		plugins = await include('build/webpack/plugins')({buildId, name}),
		modules = await include('build/webpack/module')({buildId, plugins}),
		target = await include('build/webpack/target');

	/** @type {import('webpack').Configuration} */
	const config = {
		name,

		entry: webpackEntry,
		output: await include('build/webpack/output')({buildId}),

		resolve: await include('build/webpack/resolve'),
		resolveLoader: await include('build/webpack/resolve-loader'),
		externals: await include('build/webpack/externals')({buildId}),

		module: {...modules, rules: [...modules.rules.values()]},
		plugins: [...plugins.values()],

		mode: webpack.mode(),
		optimization: await include('build/webpack/optimization')({buildId, plugins}),

		devtool: await include('build/webpack/devtool'),
		cache: await include('build/webpack/cache')({buildId}),
		watchOptions: include('build/webpack/watch-options'),
		snapshot: include('build/webpack/snapshot'),
		stats: include('build/webpack/stats'),

		...await include('build/webpack/custom/options')({buildId})
	};

	if (build.trace()) {
		wrapLoaders(config.module.rules);
	}

	if (target != null) {
		config.target = target;
	}

	if (dependencies) {
		config.dependencies = dependencies;
	}

	return config;
}

/**
 * A list of promises with WebPack configs
 */
const tasks = (async () => {
	await include('build/snakeskin');

	const {processes} = await include('build/graph');

	const done = tracer.measure('Generate webpack config', {cat: ['config']});

	const
		tasks = await $C(processes).async
			.filter((item) => !Object.isEmpty(item.entries))
			.map((el, i) => buildFactory(el, i));

	done();

	globalThis.WEBPACK_CONFIG = tasks;
	return tasks;
})();

module.exports = tasks;
