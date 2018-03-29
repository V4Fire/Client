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
	{EventEmitter2: EventEmitter} = require('eventemitter2'),
	{args} = include('build/build.webpack');

async function buildFactory(entry, buildId = '00') {
	return {
		entry,
		output: await include('build/output.webpack'),
		resolve: await include('build/resolve.webpack'),
		resolveLoader: await include('build/resolve-loader.webpack'),
		externals: await include('build/externals.webpack'),
		module: await include('build/module.webpack'),
		plugins: await include('build/plugins.webpack')({buildId}),
		mode: isProd ? 'production' : 'development',
		optimization: await include('build/optimization.webpack')({buildId})
	};
}

const
	build = include('build/entities.webpack'),
	buildEvent = new EventEmitter({maxListeners: build.MAX_PROCESS});

const predefinedTasks = $C(build.MAX_PROCESS).map((el, i) => new Promise((resolve) => {
	buildEvent.once(`build.${i}`, resolve);
	buildEvent.once(`build.all`, (config) => {
		resolve({
			...include('build/fake.webpack'),
			output: config.output,
			mode: 'development'
		});
	});
}));

const tasks = (async () => {
	await include('build/snakeskin.webpack');

	const graph = await build;
	console.log('Project graph initialized');

	const tasks = global.WEBPACK_CONFIG = await (
		args.single ? buildFactory(graph.entry) : $C(graph.processes).async.map((el, i) => buildFactory(el, i))
	);

	$C(tasks).forEach((config, i) => {
		buildEvent.emit(`build.${i}`, config);
	});

	buildEvent.emit(`build.all`, tasks[0]);
	buildEvent.removeAllListeners();

	return tasks;
})();

// FIXME: https://github.com/trivago/parallel-webpack/issues/76
module.exports = /([/\\])webpack-cli\1/.test(module.parent.id) ? tasks : predefinedTasks;
