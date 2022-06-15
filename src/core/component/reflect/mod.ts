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
 * Returns a dictionary with modifiers from the specified component.
 * This function takes the raw declaration of modifiers, normalizes it, and mixes with the design system modifiers
 * (if there are specified).
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
	const
		{constructor, componentName} = component;

	const
		mods = {};

	const
		modsFromDS = dsComponentsMods?.[componentName],
		modsFromConstructor = {...constructor['mods']};

	if (Object.isDictionary(modsFromDS)) {
		for (let keys = Object.keys(modsFromDS), i = 0; i < keys.length; i++) {
			const
				key = keys[i],
				dsModDecl = modsFromDS[key],
				modDecl = modsFromConstructor[key];

			modsFromConstructor[key] = modDecl != null ? modDecl.concat(dsModDecl) : dsModDecl;
		}
	}

	for (let o = modsFromConstructor, keys = Object.keys(o), i = 0; i < keys.length; i++) {
		const
			key = keys[i],
			modDecl = o[key],
			modValues: Array<string | object> = [];

		if (modDecl != null) {
			let
				cache: Nullable<Map<any, any>> = null,
				active;

			for (let i = 0; i < modDecl.length; i++) {
				cache ??= new Map();

				const
					modVal = modDecl[i];

				if (Object.isArray(modVal)) {
					if (active !== undefined) {
						cache.set(active, active);
					}

					active = String(modVal[0]);
					cache.set(active, [active]);

				} else {
					const
						normalizedModVal = Object.isPlainObject(modVal) ? modVal : String(modVal);

					if (!cache.has(normalizedModVal)) {
						cache.set(normalizedModVal, normalizedModVal);
					}
				}
			}

			if (cache != null) {
				for (let o = cache.values(), el = o.next(); !el.done; el = o.next()) {
					modValues.push(el.value);
				}
			}
		}

		mods[key.camelize(false)] = modValues;
	}

	return mods;
}
