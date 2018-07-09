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
	webpack = require('webpack'),
	config = require('config');

const
	path = require('path'),
	fs = require('fs-extra-promise');

const
	HardSourceWebpackPlugin = require('hard-source-webpack-plugin'),
	build = include('build/entities.webpack');

const
	{src, webpack: wp} = config,
	{buildCache, stdCache, stdManifest, hash} = include('build/build.webpack');

/**
 * Returns a list of webpack plugins
 *
 * @param {number} buildId - build id
 * @returns {Map}
 */
module.exports = async function ({buildId}) {
	const
		context = src.cwd(),
		isSTD = buildId === build.STD,
		graph = await build;

	const plugins = new Map([
		['globals', new webpack.DefinePlugin(include('build/globals.webpack'))],
		['dependencies', include('build/dependencies.webpack')({graph})]
	]);

	if (isSTD) {
		plugins.set('stdDLL', new webpack.DllPlugin({
			context,
			name: hash(src.output()),
			path: stdManifest,
		}));

	} else if (stdManifest && fs.existsSync(stdManifest)) {
		plugins.set('stdDLLReference', new webpack.DllReferencePlugin({
			context,
			manifest: stdManifest
		}));
	}

	if (wp.longCache()) {
		const expandConfig = (config, obj) => {
			$C(obj).forEach((el, key) => {
				if (Object.isFunction(el)) {
					if (!el.length) {
						try {
							config[key] = el.call(obj);

						} catch (_) {}
					}

				} else if (Object.isObject(el)) {
					config[key] = {};
					config[key] = expandConfig(config[key], el);

				} else if (Object.isArray(el)) {
					config[key] = [];
					config[key] = expandConfig(config[key], el);

				} else {
					config[key] = el;
				}
			});

			return config;
		};

		plugins.set('buildCache', new HardSourceWebpackPlugin({
			environmentHash: {files: ['package-lock.json', 'yarn.lock']},
			cacheDirectory: path.join(isSTD ? stdCache : buildCache, String(buildId), wp.cacheDir()),
			configHash: () => require('node-object-hash')().hash({
				webpack: global.WEBPACK_CONFIG,
				config: expandConfig({}, config)
			})
		}));
	}

	return plugins;
};
