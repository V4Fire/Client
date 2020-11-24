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
	path = require('upath');

const
	{webpack} = require('config'),
	{assetsJSON, assetsJS} = include('build/build.webpack');

/**
 * WebPack plugin to generate ".dependencies.js" files and "assets.json" / "assets.js"
 * @returns {!Function}
 */
module.exports = function DependenciesPlugin() {
	return {
		apply(compiler) {
			compiler.hooks.emit.tap('DependenciesPlugin', (compilation) => {
				const
					manifest = {};

				$C(compilation.chunks).forEach(({name, files}) => {
					if (name == null) {
						return;
					}

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
