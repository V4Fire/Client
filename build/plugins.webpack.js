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
	config = require('config'),
	path = require('path');

const
	HardSourceWebpackPlugin = require('hard-source-webpack-plugin'),
	build = include('build/entities.webpack');

const
	{webpack: wp} = config,
	{buildCache} = include('build/build.webpack');

/**
 * Returns a list of webpack plugins
 *
 * @param {number} buildId - build id
 * @returns {Map}
 */
module.exports = async function ({buildId}) {
	const
		graph = await build;

	const plugins = new Map([
		['globals', new webpack.DefinePlugin(await $C(include('build/globals.webpack')).async.map())],
		['dependencies', include('build/plugins/dependencies')({graph})]
	]);

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
			cacheDirectory: path.join(buildCache, String(buildId), wp.cacheDir()),
			configHash: () => require('node-object-hash')().hash({
				webpack: global.WEBPACK_CONFIG,
				config: expandConfig({}, config)
			})
		}));
	}

	return plugins;
};
