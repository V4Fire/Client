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
	config = require('config');

const
	fs = require('fs'),
	path = require('path');

const
	{output, assetsJSON} = include('build/build.webpack'),
	{MODULE_DEPENDENCIES} = include('build/globals.webpack');

const
	hash = include('build/hash');

/**
 * WebPack plugin for .dependencies.js files and assets.js
 *
 * @param {{entry, processes, dependencies}} graph - build object
 * @returns {!Function}
 */
module.exports = function ({graph}) {
	const
		p = config.webpack.publicPath(),
		publicPath = (src) => p + path.basename(src);

	return {
		apply(compiler) {
			compiler.hooks.emit.tap('DependenciesPlugin', (compilation) => {
				const
					manifest = {};

				$C(graph.dependencies).forEach((el, key) => {
					const
						content = `window[${MODULE_DEPENDENCIES}].add("${key}", ${JSON.stringify([...el])});`,
						name = `${key}.dependencies`;

					const src = output
						.replace(/\[name]/g, `${name}.js`)
						.replace(/\[hash:?(\d*)]/, (str, length) => hash(content, Number(length)));

					manifest[name] = publicPath(src);
					fs.writeFileSync(src, content);
				});

				$C(compilation.chunks).forEach(({name, files}) => {
					const
						file = $C(files).one.filter((src) => path.extname(src)).get();

					if (file) {
						manifest[path.basename(name, path.extname(name))] = publicPath(file);
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
