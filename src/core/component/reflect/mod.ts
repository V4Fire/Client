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
	const {constructor, componentName} = component;

	const
		mods = {},
		modsFromDS = dsComponentsMods?.[componentName],
		modsFromConstructor: ModsDecl = {...constructor['mods']};

	if (Object.isDictionary(modsFromDS)) {
		const modNames = Object.keys(modsFromDS);

		for (let i = 0; i < modNames.length; i++) {
			const
				modName = modNames[i],
				modDecl = modsFromConstructor[modName];

			modsFromConstructor[modName] = Object.cast(Array.toArray(modDecl, modsFromDS[modName]));
		}
	}

	const modNames = Object.keys(modsFromConstructor);

	for (let i = 0; i < modNames.length; i++) {
		const
			modName = modNames[i],
			modDecl = modsFromConstructor[modName],
			modValues: Array<string | object> = [];

		if (modDecl != null && modDecl.length > 0) {
			let active: CanUndef<string>;

			const cache = new Map();

			for (const modVal of modDecl) {
				if (Object.isArray(modVal)) {
					if (active !== undefined) {
						cache.set(active, active);
					}

					active = String(modVal[0]);
					cache.set(active, [active]);

				} else {
					const normalizedModVal = Object.isDictionary(modVal) ? modVal : String(modVal);

					if (!cache.has(normalizedModVal)) {
						cache.set(normalizedModVal, normalizedModVal);
					}
				}
			}

			for (const val of cache.values()) {
				modValues.push(val);
			}
		}

		mods[modName.camelize(false)] = modValues;
	}

	return mods;
}
