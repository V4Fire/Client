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
	{config: pzlr} = require('@pzlr/build-core'),
	{getDSComponentMods, getThemes, getDS} = include('build/ds');

const
	graph = include('build/graph.webpack');

const
	runtime = config.runtime(),
	s = JSON.stringify;

/**
 * Object to provide to WebPack.DefinePlugin
 * @type {!Object}
 */
module.exports = {
	IS_PROD,
	DEBUG: runtime.debug === true,
	MODULE: s(config.typescript().client.compilerOptions.module),

	APP_NAME: s(APP_NAME),
	API_URL: s(API_URL),

	LOCALE: s(LOCALE),
	PUBLIC_PATH: s(config.webpack.publicPath()),
	CSP_NONCE_STORE: s(config.csp.nonceStore),

	'process.env': {
		NODE_ENV: s(process.env.NODE_ENV)
	},

	COMPONENTS: graph.then(({blockMap}) => {
		if (Object.isMap(blockMap)) {
			return $C(blockMap).to({}).reduce((res, el, key) => {
				res[key] = {
					dependencies: JSON.stringify(el.dependencies)
				};

				return res;
			});
		}

		return {};
	}),

	BLOCK_NAMES: runtime.blockNames ?
		graph.then(({blockMap}) => {
			if (Object.isMap(blockMap)) {
				const blockNames = Array.from(blockMap.keys()).filter((el) => /^b-/.test(el));
				return s(blockNames);
			}
		}) :

		null,

	THEME: s(config.theme.default()),
	THEME_ATTRIBUTE: s(config.theme.attribute),
	AVAILABLE_THEMES: pzlr.designSystem ?
		s(getThemes(getDS(), config.theme.include() || [config.theme.default()])) :
		null,

	DS_COMPONENTS_MODS: pzlr.designSystem ?
		getDSComponentMods() :
		null,

	DS: runtime.passDesignSystem && pzlr.designSystem ?
		s(getDS()) :
		null
};
