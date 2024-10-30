/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

'use strict';

const
	$C = require('collection.js'),
	config = require('@config/config');

const
	{csp, build, webpack, i18n} = config,
	{config: pzlr} = require('@pzlr/build-core'),
	{collectI18NKeysets, getLayerName} = include('build/helpers'),
	{getDSComponentMods, getThemes, getDS} = include('build/ds');

const
	projectGraph = include('build/graph'),
	s = JSON.stringify;

const
	locales = i18n.supportedLocales(),
	runtime = config.runtime(),
	typescript = config.typescript();

/**
 * A dictionary to provide to `webpack.DefinePlugin`
 * @type {object}
 */
module.exports = {
	IS_PROD,

	DEBUG: runtime.debug === true,
	BUILD_MODE: s(build.mode()),
	BUILD_EDITION: s(build.edition),

	PUBLIC_PATH: s(webpack.publicPath()),
	CSP_NONCE_STORE: s(csp.nonceStore()),

	SSR: webpack.ssr,
	HYDRATION: webpack.hydration(),
	MODULE: s(typescript.client.compilerOptions.module),

	APP_NAME: s(APP_NAME),
	API_URL: s(API_URL),

	LOCALE: s(LOCALE),
	REGION: typeof REGION !== 'undefined' ? s(REGION) : undefined,
	LANG_KEYSETS: s(collectI18NKeysets(locales)),
	LANG_PACKS: s(config.i18n.langPacksStore),

	COMPONENTS: projectGraph.then(({components}) => {
		if (Object.isMap(components)) {
			return $C(components).to({}).reduce((res, el, key) => {
				let layer;

				if (el.logic != null) {
					layer = JSON.stringify(getLayerName(el.logic));
				} else {
					layer = JSON.stringify(getLayerName(el.index));
				}

				res[key] = {
					parent: JSON.stringify(el.parent),
					dependencies: JSON.stringify(el.dependencies),
					layer
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

	POST_PROCESS_THEME: s(config.theme.postProcessor),

	DS: runtime.passDesignSystem && pzlr.designSystem ?
		s(getDS()) :
		null,

	DS_COMPONENTS_MODS: pzlr.designSystem ?
		getDSComponentMods() :
		null
};
