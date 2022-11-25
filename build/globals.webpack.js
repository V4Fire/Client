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
	config = require('@config/config');

const
	{csp, build, webpack} = config,
	{config: pzlr} = require('@pzlr/build-core'),
	{getDSComponentMods, getThemes, getDS} = include('build/ds');

const
	projectGraph = include('build/graph'),
	s = JSON.stringify;

const
	runtime = config.runtime(),
	typescript = config.typescript();

/**
 * A dictionary to provide to `webpack.DefinePlugin`
 * @type {!Object}
 */
module.exports = {
	IS_PROD,

	DEBUG: runtime.debug === true,
	BUILD_MODE: s(build.mode),
	CSP_NONCE_STORE: s(csp.nonceStore()),

	SSR: webpack.ssr,
	HYDRATION: webpack.hydration(),
	MODULE: s(typescript.client.compilerOptions.module),

	APP_NAME: s(APP_NAME),
	API_URL: s(API_URL),

	LOCALE: s(LOCALE),
	PUBLIC_PATH: s(webpack.publicPath()),

	COMPONENTS: projectGraph.then(({components}) => {
		if (Object.isMap(components)) {
			return $C(components).to({}).reduce((res, el, key) => {
				res[key] = {
					dependencies: JSON.stringify(el.dependencies)
				};

				return res;
			});
		}

		return {};
	}),

	BLOCK_NAMES: runtime.blockNames ?
		projectGraph.then(({components}) => {
			if (Object.isMap(components)) {
				const blockNames = Array.from(components.keys()).filter((el) => /^b-/.test(el));
				return s(blockNames);
			}
		}) :

		null,

	THEME: s(config.theme.default()),
	THEME_ATTRIBUTE: s(config.theme.attribute),
	AVAILABLE_THEMES: pzlr.designSystem ?
		s(getThemes(getDS(), config.theme.include() || [config.theme.default()])) :
		null,

	DS: runtime.passDesignSystem && pzlr.designSystem ?
		s(getDS()) :
		null,

	DS_COMPONENTS_MODS: pzlr.designSystem ?
		getDSComponentMods() :
		null
};
