'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

require('@v4fire/core/build/i18n');
require('./gulpfile');

const
	$C = require('collection.js'),
	config = require('config'),
	path = require('path');

const
	{hash, args, version} = include('build/helpers.webpack'),
	{src} = config;

const
	cwd = src.cwd,
	folders = src.client,
	entryFolder = folders[0];

const
	output = r('[hash]_[name]'),
	assetsJSON = r(`${version}assets.json`),
	lib = path.join(src.cwd, 'node_modules');

const build = include('build/entities.webpack')({
	entries: path.join(entryFolder, 'entries'),
	output: hash(output),
	cache: Number(process.env.FROM_CACHE) && path.join(src.cwd, 'app-cache/graph'),
	folders,
	assetsJSON,
	lib
});

include('build/snakeskin.webpack')(folders);
console.log('Project graph initialized');

function r(file) {
	return `./${path.relative(cwd, path.join(src.clientOutput(), file)).replace(/\\/g, '/')}`;
}

function buildFactory(entry, i = '00') {
	return {
		entry,
		output: include('build/output.webpack')({output}),
		resolve: include('build/resolve.webpack')({modules: [entryFolder, cwd, ...folders.slice(1), lib]}),
		resolveLoader: include('build/resolve-loader.webpack'),
		externals: include('build/externals.webpack'),
		module: include('build/module.webpack')({build, output, folders}),
		plugins: include('build/plugins.webpack')({build, assetsJSON, output, i})
	};
}

module.exports = args.single ?
	buildFactory(build.entry) : $C(build.processes).map((el, i) => buildFactory(el, i));
