'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
	{config: pzlr} = require('@pzlr/build-core'),
	{dsHasThemesNotIncluded} = include('build/stylus/ds/const');

/**
 * Returns parameters of the design system
 * @returns {?DesignSystem}
 */
exports.getDS = function getDS() {
	try {
		return require(pzlr.designSystem);

	} catch (err) {
		console.error(
			`An error occurred while getting the design system package from "${pzlr.designSystem}". The message:`,
			err
		);

		return null;
	}
};

/**
 * Returns available themes from the specified design system package.
 *
 * Pass to the second argument:
 *   * An array of theme names to include them to the build.
 *     Note that names must be included in the design system object.
 *
 *   * `true`, if necessary to pass all themes from the specified design system object
 *
 * @param {!DesignSystem} ds - a raw design system object (e.g. loaded from the linked in the `.pzlrrc` package)
 * @param {(!Array<string>|true)} buildThemes
 *
 * @returns {?Array<string>}
 */
exports.getThemes = function getThemes(ds, buildThemes) {
	const
		{meta} = ds;

	if (Object.isObject(meta) && meta.themes !== undefined) {
		if (buildThemes === undefined) {
			throw new Error(dsHasThemesNotIncluded);
		}

		if (buildThemes === true) {
			return meta.themes || null;
		}

		const dsMatched = buildThemes.reduce((res, t) => {
			if (meta.themes.includes(t)) {
				res.push(t);
			}

			return res;
		}, []);

		if (dsMatched.length === 0) {
			throw new Error(dsHasThemesNotIncluded);
		}

		return dsMatched;
	}

	return null;
};

/**
 * Returns modifier values grouped by component names from the design system package
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
