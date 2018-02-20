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
	fs = require('fs'),
	path = require('path');

const
	{assetsJSON} = include('build/build.webpack');

/**
 * WebPack plugin for assets.js
 *
 * @param {{entry, processes, dependencies}} build - build object
 * @returns {!Function}
 */
module.exports = {
	apply(compiler) {
		compiler.plugin('emit', (compilation, cb) => {
			const manifest = $C(compilation.chunks).to({}).reduce((map, {name, files}) => {
				const
					file = $C(files).one.filter((src) => path.extname(src)).get();

				if (file) {
					map[path.basename(name, path.extname(name))] = path.basename(file);
				}

				return map;
			});

			let
				fd,
				assets = {};

			try {
				fd = fs.openSync(assetsJSON, 'r+');

			} catch (_) {
				fd = fs.openSync(assetsJSON, 'w+');
			}

			const
				file = fs.readFileSync(fd, 'utf-8');

			try {
				assets = JSON.parse(file);

			} catch (_) {}

			Object.assign(assets, manifest);

			fs.writeFileSync(fd, JSON.stringify(assets));
			fs.closeSync(fd);

			fs.writeFileSync(assetsJSON.replace(/\.json$/, '.js'), $C(assets).to('').map((el, key) => `PATH['${key}'] = '${el}';\n`));
			cb();
		});
	}
};
