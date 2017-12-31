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
	{args} = include('build/build.webpack');

async function buildFactory(entry, buildId = '00') {
	return {
		entry,
		output: await include('build/output.webpack'),
		resolve: await include('build/resolve.webpack'),
		resolveLoader: await include('build/resolve-loader.webpack'),
		externals: await include('build/externals.webpack'),
		module: await include('build/module.webpack'),
		plugins: await include('build/plugins.webpack')({buildId})
	};
}

module.exports = (async () => {
	await include('build/snakeskin.webpack');

	const
		build = await include('build/entities.webpack');

	console.log('Project graph initialized');

	return args.single ?
		buildFactory(build.entry) : $C(build.processes).async.map((el, i) => buildFactory(el, i));
})();
