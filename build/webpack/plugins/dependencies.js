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
	{webpack} = require('@config/config'),
	{assetsJSON, assetsJS} = include('build/helpers');

/**
 * Webpack plugin to generate `.dependencies.js` files and `assets.json` / `assets.js`
 */
module.exports = class DependenciesPlugin {
	apply(compiler) {
		compiler.hooks.emit.tap('DependenciesPlugin', (compilation) => {
			const
				manifest = {};

			$C(compilation.chunks).forEach((el) => {
				if (el.name == null) {
					return;
				}

				const
					file = $C(el.files).one.filter((src) => path.extname(src)).get();

				if (file) {
					const
						key = path.basename(el.name),
						extname = path.extname(file);

					if (manifest[key] && extname !== '.js') {
						return;
					}

					manifest[key] = {
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
					assets = JSON.parse(fs.readFileSync(fd).toString());

				} catch {}

				fs.closeSync(fd);

			} catch {}

			Object.assign(assets, manifest);

			fd = fs.openSync(assetsJSON, 'w');
			fs.writeFileSync(fd, JSON.stringify(assets));
			fs.closeSync(fd);

			fs.writeFileSync(assetsJS, $C(assets).to('').map((el, key) => `PATH['${key}'] = '${el.path}';\n`));
		});
	}
};
