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
	config = require('@config/config'),
	webpack = require('webpack');

/**
 * Returns parameters for `webpack.plugins`
 *
 * @param {object} opts
 * @param {string} opts.name
 * @returns {Map}
 */
module.exports = async function plugins({name}) {
	const
		globals = include('build/globals.webpack');

	const
		DependenciesPlugin = include('build/webpack/plugins/dependencies'),
		createProgressPlugin = include('build/webpack/plugins/progress-plugin'),
		MeasurePlugin = include('build/webpack/plugins/measure-plugin'),
		IgnoreInvalidWarningsPlugin = include('build/webpack/plugins/ignore-invalid-warnings'),
		I18NGeneratorPlugin = include('build/webpack/plugins/i18n-plugin'),
		InvalidateExternalCachePlugin = include('build/webpack/plugins/invalidate-external-cache'),
		AsyncChunksPlugin = include('build/webpack/plugins/async-chunks-plugin'),
		StatoscopeWebpackPlugin = require('@statoscope/webpack-plugin').default;

	const plugins = new Map([
		['globals', new webpack.DefinePlugin(await $C(globals).async.map())],
		['ignoreNotFoundExport', new IgnoreInvalidWarningsPlugin()],
		['i18nGeneratorPlugin', new I18NGeneratorPlugin()],
		['invalidateExternalCache', new InvalidateExternalCachePlugin()]
	]);

	if (!config.webpack.ssr) {
		plugins.set('dependencies', new DependenciesPlugin());
	}

	if (config.webpack.mode() !== 'production' || config.build.trace()) {
		plugins.set('measurePlugin', new MeasurePlugin({
			output: 'trace.json',
			trace: config.build.trace()
		}));
	}

	const
		statoscopeConfig = config.statoscope();

	if (statoscopeConfig.enabled) {
		plugins.set(
			'statoscope-webpack-plugin',
			new StatoscopeWebpackPlugin(statoscopeConfig.webpackPluginConfig)
		);
	}

	if (config.webpack.progress()) {
		plugins.set('progress-plugin', createProgressPlugin(name));
	}

	const isThirdFatHTMLMode = config.webpack.fatHTML() === 3;

	if ((config.webpack.fatHTML() && !isThirdFatHTMLMode) || config.webpack.storybook() || config.webpack.ssr) {
		plugins.set('limit-chunk-count-plugin', new webpack.optimize.LimitChunkCountPlugin({
			maxChunks: 1
		}));
	}

	if (isThirdFatHTMLMode) {
		plugins.set('async-chunk-plugin', new AsyncChunksPlugin());
	}

	return plugins;
};
