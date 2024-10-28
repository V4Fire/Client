/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

'use strict';

const
	$C = require('collection.js');

const
	fs = require('node:fs'),
	path = require('upath');

const
	{webpack, src} = require('@config/config'),
	{assetsJSON, assetsJS} = include('build/helpers');

const
	genHash = include('build/hash'),
	faviconsFolder = include(src.rel('assets', 'favicons'), {return: 'path'});

/**
 * Webpack plugin to generate `.dependencies.js` files and `assets.json` / `assets.js`
 */
module.exports = class DependenciesPlugin {
	/**
	 * @param {import('webpack').Compiler} compiler
	 */
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

			const
				assetsDest = path.dirname(webpack.assetsOutput()),
				faviconsHash = genHash(path.join(faviconsFolder, '/**/*')),
				faviconsKey = 'favicons';

			const
				faviconsPath = `${assetsDest}/${faviconsHash}_${faviconsKey}`,
				faviconsDest = webpack.publicPath(faviconsPath);

			const staticAssetsPath = {
				[faviconsKey]: {
					path: faviconsPath,
					publicPath: faviconsDest
				}
			};

			Object.assign(assets, manifest, staticAssetsPath);

			fd = fs.openSync(assetsJSON, 'w');
			fs.writeFileSync(fd, JSON.stringify(assets));
			fs.closeSync(fd);

			fs.writeFileSync(assetsJS, $C(assets).to('').map((el, key) => `PATH['${key}'] = '${el.path}';\n`));
		});
	}
};
