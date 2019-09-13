'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/* eslint-disable quote-props */

const
	config = require('config'),
	{config: pzlr} = require('@pzlr/build-core');

const
	runtime = config.runtime(),
	s = JSON.stringify;

module.exports = {
	IS_PROD,

	LOCALE: s(LOCALE),
	API_URL: s(API_URL),
	APP_NAME: s(APP_NAME),
	PUBLIC_PATH: s(config.webpack.publicPath()),

	MODULE_DEPENDENCIES: s(`ModuleDependencies${runtime.noGlobals ? `_${Number.random(1e6)}` : ''}`),
	'process.env': {
		NODE_ENV: s(process.env.NODE_ENV)
	},

	BLOCK_NAMES: runtime.blockNames ? include('build/entities.webpack').then(({blockMap}) => {
		if (Object.isMap(blockMap)) {
			const blockNames = Array.from(blockMap.keys()).filter((el) => /^b-/.test(el));
			return s(blockNames);
		}
	}) : undefined,

	DS_COMPONENTS_MODS: pzlr.designSystem ? calcComponentsMods() : null,
	DS: runtime.passDesignSystem && pzlr.designSystem ? (() => {
		try {
			return s(require(pzlr.designSystem));

		} catch {
			console.log('Cannot find the design system package by the specified name on globals DS including');
			return null;
		}
	})() : null
};

/**
 * Returns modifier values grouped by a component name from a Design System package
 * @returns {Object}
 */
function calcComponentsMods() {
	try {
		const
			{components} = require(pzlr.designSystem);

		if (Object.isObject(components)) {
			return s(Object.keys(components).reduce((res, componentName) => {
				const
					comp = components[componentName],
					mods = {};

				if (comp.mods) {
					Object.assign(mods, comp.mods);
				}

				if (comp.exterior) {
					Object.assign(mods, {exterior: comp.exterior});
				}

				if (comp.mods || comp.exterior) {
					const
						r = res[componentName.dasherize()] = {};

					Object.forEach(mods, (m, modName) => {
						r[modName] = Object.keys(m);
					});
				}

				return res;
			}, {}));

		}

		console.log('Cannot find components at the design system package');
		return null;

	} catch {
		console.log('Cannot find a design system package by the specified name on component mods calculating');

		return null;
	}
}
