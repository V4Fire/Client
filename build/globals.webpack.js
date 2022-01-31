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
	{config: pzlr} = require('@pzlr/build-core'),
	{getDSComponentMods, getThemes, getDS} = include('build/ds');

const
	projectGraph = include('build/graph');

const
	runtime = config.runtime(),
	s = JSON.stringify;

/**
 * Object to provide to `webpack.DefinePlugin`
 * @type {!Object}
 */
module.exports = {
	IS_PROD,
	DEBUG: runtime.debug === true,

	APP_NAME: s(APP_NAME),
	API_URL: s(API_URL),

	LOCALE: s(LOCALE),
	PUBLIC_PATH: s(config.webpack.publicPath()),
	CSP_NONCE_STORE: s(config.csp.nonceStore()),
	MODULE: s(config.typescript().client.compilerOptions.module),

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
