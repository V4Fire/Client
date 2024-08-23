/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { dsComponentsMods } from 'core/component/reflect/const';

import type { ModsDecl } from 'core/component/interface';
import type { ComponentConstructorInfo } from 'core/component/reflect/interface';

/**
 * Returns a dictionary containing normalized modifiers from the given component.
 * This function takes in the raw modifiers declaration, normalizes them, and merges them with
 * the design system modifiers if specified.
 *
 * @param component - the component information object
 *
 * @example
 * ```js
 * @component()
 * class bButton extends iBlock {
 *   static mods = {
 *     'opened-window': [
 *       true,
 *       false,
 *       undefined,
 *       [false],
 *       bButton.PARENT
 *     ]
 *   };
 * }
 *
 * // {openedWindow: ['true', ['false'], bButton.PARENT]}
 * console.log(getComponentMods(getInfoFromConstructor()));
 * ```
 */
export function getComponentMods(component: ComponentConstructorInfo): ModsDecl {
	const {
		constructor,
		componentName
	} = component;

	const
		mods = {},
		modsFromDS = dsComponentsMods?.[componentName],
		modsFromConstructor: ModsDecl = {...constructor['mods']};

	if (Object.isDictionary(modsFromDS)) {
		Object.entries(modsFromDS).forEach(([name, dsModDecl]) => {
			const modDecl = modsFromConstructor[name];
			modsFromConstructor[name] = Object.cast(Array.toArray(modDecl, dsModDecl));
		});
	}

	Object.entries(modsFromConstructor).forEach(([modName, modDecl]) => {
		const modValues: Array<string | object> = [];

		if (modDecl != null && modDecl.length > 0) {
			const cache = new Map();

			let active: CanUndef<string>;

			modDecl.forEach((modVal) => {
				if (Object.isArray(modVal)) {
					if (active !== undefined) {
						cache.set(active, active);
					}

					active = String(modVal[0]);
					cache.set(active, [active]);

				} else {
					const normalizedModVal = Object.isDictionary(modVal) ?
						modVal :
						String(modVal);

					if (!cache.has(normalizedModVal)) {
						cache.set(normalizedModVal, normalizedModVal);
					}
				}
			});

			cache.forEach((val) => {
				modValues.push(val);
			});
		}

		mods[modName.camelize(false)] = modValues;
	});

	return mods;
}
