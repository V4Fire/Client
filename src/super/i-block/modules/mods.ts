/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import iBlock from 'super/i-block/i-block';
import { ExperimentsSet } from 'core/abt/interface';
import { ModVal, ModsDecl } from 'core/component';

export { ModVal, ModsDecl };
export type ModsTable = Dictionary<ModVal>;
export type ModsNTable = Dictionary<CanUndef<string>>;

/**
 * Merges old component modifiers with new
 * (for functional components)
 *
 * @param component
 * @param oldComponent
 * @param key - field key
 * @param link - link key
 */
export function mergeMods<T extends iBlock>(
	component: T,
	oldComponent: T,
	key: string,
	link?: string
): void {
	if (!link) {
		return;
	}

	const
		// @ts-ignore (access)
		cache = component.$syncLinkCache[link];

	if (!cache) {
		return;
	}

	const
		l = cache[key];

	if (!l) {
		return;
	}

	const getFullModsProp = (o) => {
		const
			declMods = o.meta.component.mods,
			res = {...o.$props[link]};

		for (let attrs = o.$attrs, keys = Object.keys(attrs), i = 0; i < keys.length; i++) {
			const
				key = keys[i];

			if (key in declMods) {
				const
					attrVal = attrs[key];

				if (attrVal != null) {
					res[key] = attrVal;
				}
			}
		}

		return res;
	};

	const
		modsProp = getFullModsProp(component),
		mods = {...oldComponent.mods};

	for (let keys = Object.keys(mods), i = 0; i < keys.length; i++) {
		const
			key = keys[i];

		// @ts-ignore (access)
		if (component.sync.syncModCache[key]) {
			delete mods[key];
		}
	}

	if (Object.fastCompare(modsProp, getFullModsProp(oldComponent))) {
		l.sync(mods);

	} else {
		// tslint:disable-next-line:prefer-object-spread
		l.sync(Object.assign(mods, modsProp));
	}
}

/**
 * Initializes the component modifiers
 * @param component
 */
export function initMods<T extends iBlock>(component: T): ModsNTable {
	const
		// @ts-ignore (access)
		declMods = component.meta.component.mods,
		attrMods = <string[][]>[],
		modVal = (val) => val != null ? String(val) : undefined;

	// @ts-ignore (access)
	for (let attrs = component.$attrs, keys = Object.keys(attrs), i = 0; i < keys.length; i++) {
		const
			key = keys[i];

		if (declMods[key]) {
			const attrVal = attrs[key];
			component.watch(`$attrs.${key}`, (val) => component.setMod(key, modVal(val)));

			if (attrVal == null) {
				continue;
			}

			attrMods.push([key, attrVal]);
		}
	}

	function link(propMods: ModsTable): ModsNTable {
		const
			// tslint:disable-next-line:prefer-object-spread
			mods = component.mods || {...declMods};

		if (propMods) {
			for (let keys = Object.keys(propMods), i = 0; i < keys.length; i++) {
				const
					key = keys[i],
					val = propMods[key];

				if (val != null || mods[key] == null) {
					mods[key] = modVal(val);
				}
			}
		}

		for (let i = 0; i < attrMods.length; i++) {
			const [key, val] = attrMods[i];
			mods[key] = val;
		}

		const
			{experiments} = component.$root.remoteState;

		if (Object.isArray(experiments)) {
			for (let i = 0; i < experiments.length; i++) {
				const
					el = (<ExperimentsSet>experiments)[i],
					experimentMods = el.meta && el.meta.mods;

				if (experimentMods) {
					for (let keys = Object.keys(experimentMods), i = 0; i < keys.length; i++) {
						const
							key = keys[i],
							val = experimentMods[key];

						if (val != null || mods[key] == null) {
							mods[key] = modVal(val);
						}
					}
				}
			}
		}

		for (let keys = Object.keys(mods), i = 0; i < keys.length; i++) {
			const
				key = keys[i],
				val = modVal(mods[key]);

			mods[key] = val;
			component.hook !== 'beforeDataCreate' && component.setMod(key, val);
		}

		return mods;
	}

	return component.sync.link<any>(link);
}

/**
 * Returns an object with watchable modifiers
 * @param component
 */
export function getWatchableMods<T extends iBlock>(component: T): Readonly<ModsNTable> {
	const
		o = {},
		w = <NonNullable<ModsNTable>>component.field.get('watchModsStore'),
		m = component.mods;

	for (let keys = Object.keys(m), i = 0; i < keys.length; i++) {
		const
			key = keys[i],
			val = m[key];

		if (key in w) {
			o[key] = val;

		} else {
			Object.defineProperty(o, key, {
				get: () => {
					if (!(key in w)) {
						w[key] = val;
					}

					return val;
				}
			});
		}
	}

	return Object.freeze(o);
}
