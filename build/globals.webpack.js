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
	{getDSComponentMods} = include('build/ds');

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

	APP_NAME: s(APP_NAME),
	API_URL: s(API_URL),

	LOCALE: s(LOCALE),
	PUBLIC_PATH: s(config.webpack.publicPath()),

	MODULE_DEPENDENCIES: s(
		`ModuleDependencies${runtime.noGlobals ? `_${Number.random(1e6)}` : ''}`
	),

	'process.env': {
		NODE_ENV: s(process.env.NODE_ENV)
	},

	COMPONENTS: include('build/entries.webpack').then(({blockMap}) => {
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
		include('build/entries.webpack').then(({blockMap}) => {
			if (Object.isMap(blockMap)) {
				const blockNames = Array.from(blockMap.keys()).filter((el) => /^b-/.test(el));
				return s(blockNames);
			}
		}) :

		null,

	DS_COMPONENTS_MODS: pzlr.designSystem ?
		getDSComponentMods() :
		null,

	DS: runtime.passDesignSystem && pzlr.designSystem ?
		(() => {
			try {
				return s(require(pzlr.designSystem));

			} catch {
				console.log(`Can't find "${pzlr.designSystem}" design system package`);
				return null;
			}
		})() :

		null
};
