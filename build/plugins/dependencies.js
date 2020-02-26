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
	fs = require('fs'),
	path = require('upath'),
	hash = include('build/hash');

const
	{webpack, src: {clientOutput}} = require('config'),
	{assetsJSON, assetsJS} = include('build/build.webpack'),
	{MODULE_DEPENDENCIES} = include('build/globals.webpack');

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
						content = `window[${MODULE_DEPENDENCIES}].add("${key}", ${JSON.stringify([...el])});`,
						name = `${key}.dependencies`;

					const src = webpack.output({
						name: `${name}.js`,
						hash: hash(content)
					});

					manifest[name] = {
						path: src,
						publicPath: webpack.publicPath(src)
					};

					fs.writeFileSync(path.join(clientOutput(), src), content);
				});

				$C(compilation.chunks).forEach(({name, files}) => {
					const
						file = $C(files).one.filter((src) => path.extname(src)).get();

					if (file) {
						manifest[path.basename(name, path.extname(name))] = {
							path: file,
							publicPath: webpack.publicPath(file)
						};
					}
				});

				let
					fd,
					assets = {};

				try {
					fd = fs.openSync(assetsJSON, 'r');

					try {
						assets = JSON.parse(fs.readFileSync(fd, 'utf-8'));

					} catch {}

					fs.closeSync(fd);

				} catch {}

				Object.assign(assets, manifest);

				fd = fs.openSync(assetsJSON, 'w');
				fs.writeFileSync(fd, JSON.stringify(assets));
				fs.closeSync(fd);

				fs.writeFileSync(assetsJS, $C(assets).to('').map((el, key) => `PATH['${key}'] = '${el.publicPath}';\n`));
			});
		}
	};
};
