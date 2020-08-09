'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
	{config: pzlr} = require('@pzlr/build-core');

/**
 * Returns modifier values grouped by component names from a Design System package
 * @returns {Object}
 */
exports.getDSComponentMods = function getDSComponentMods() {
	try {
		const
			{components} = require(pzlr.designSystem);

		if (Object.isObject(components)) {
			return JSON.stringify(Object.keys(components).reduce((res, componentName) => {
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
					const r = {};
					res[componentName.dasherize()] = r;

					Object.forEach(mods, (m, modName) => {
						r[modName] = Object.keys(m);
					});
				}

				return res;
			}, {}));
		}

		console.log('Can\'t find components within the design system package');
		return null;

	} catch {
		console.log(`Can't find "${pzlr.designSystem}" design system package`);
		return null;
	}
};
