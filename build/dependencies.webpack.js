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
	{webpack} = require('config');

const
	fs = require('fs'),
	path = require('path');

const
	hash = include('build/hash'),
	{output, assetsJSON} = include('build/build.webpack');

/**
 * WebPack plugin for .dependencies.js files and assets.js
 *
 * @param {{entry, processes, dependencies}} graph - build object
 * @returns {!Function}
 */
module.exports = function ({graph}) {
	return {
		apply(compiler) {
			compiler.hooks.emit.tap('DependenciesPlugin', (compilation) => {
				const
					manifest = {};

				$C(graph.dependencies).forEach((el, key) => {
					const
						content = `ModuleDependencies.add("${key}", ${JSON.stringify([...el])});`,
						name = `${key}.dependencies`;

					const src = output
						.replace(/\[name]/g, `${name}.js`)
						.replace(/\[hash:?(\d*)]/, (str, length) => hash(content, Number(length)));

					manifest[name] = webpack.publicPath(src);
					fs.writeFileSync(src, content);
				});

				$C(compilation.chunks).forEach(({name, files}) => {
					const
						file = $C(files).one.filter((src) => path.extname(src)).get();

					if (file) {
						manifest[path.basename(name, path.extname(name))] = webpack.publicPath(file);
					}
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
			});
		}
	};
};
