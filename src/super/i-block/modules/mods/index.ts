/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:super/i-block/modules/mods/README.md]]
 * @packageDocumentation
 */

import iBlock from 'super/i-block/i-block';
import { ExperimentsSet } from 'core/abt/interface';

import { ModsTable, ModsNTable } from 'super/i-block/modules/mods/interface';
export * from 'super/i-block/modules/mods/interface';

/**
 * Merges old component modifiers with new modifiers
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
		c = component.unsafe,
		cache = c.$syncLinkCache[link];

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
		modsProp = getFullModsProp(c),
		mods = {...oldComponent.mods};

	for (let keys = Object.keys(mods), i = 0; i < keys.length; i++) {
		const
			key = keys[i];

		if (c.sync.syncModCache[key]) {
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
		c = component.unsafe,
		declMods = c.meta.component.mods;

	const
		attrMods = <string[][]>[],
		modVal = (val) => val != null ? String(val) : undefined;

	for (let attrs = c.$attrs, keys = Object.keys(attrs), i = 0; i < keys.length; i++) {
		const
			key = keys[i],
			modKey = key.camelize(false);

		if (modKey in declMods) {
			const attrVal = attrs[key];
			c.watch(`$attrs.${key}`, (val: Dictionary = {}) => c.setMod(modKey, modVal(val[key])));

			if (attrVal == null) {
				continue;
			}

			attrMods.push([modKey, attrVal]);
		}
	}

	function link(propMods: ModsTable): ModsNTable {
		const
			// tslint:disable-next-line:prefer-object-spread
			mods = c.mods || {...declMods};

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
			{experiments} = c.r.remoteState;

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
			c.hook !== 'beforeDataCreate' && c.setMod(key, val);
		}

		return mods;
	}

	return c.sync.link<any>(link);
}

/**
 * Returns a dictionary with watchable modifiers
 * @param component
 */
export function getWatchableMods<T extends iBlock>(component: T): Readonly<ModsNTable> {
	const
		o = {},
		w = Object.getPrototypeOf(component.field.get<ModsNTable>('watchModsStore')!),
		m = component.mods;

	for (let keys = Object.keys(m), i = 0; i < keys.length; i++) {
		const
			key = keys[i];

		if (key in w) {
			o[key] = m[key];

		} else {
			Object.defineProperty(o, key, {
				configurable: true,
				enumerable: true,
				get: () => {
					const
						val = m[key];

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
