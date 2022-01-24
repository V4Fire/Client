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

import type iBlock from '@src/super/i-block/i-block';
import type { ModsTable, ModsNTable } from '@src/super/i-block/modules/mods/interface';

export * from '@src/super/i-block/modules/mods/interface';

/**
 * Merges old component modifiers with new modifiers
 * (for functional components)
 *
 * @param component
 * @param oldComponent
 * @param key - field key
 * @param link - link key
 */
export function mergeMods(
	component: iBlock,
	oldComponent: iBlock,
	key: string,
	link?: string
): void {
	if (link == null) {
		return;
	}

	const
		ctx = component.unsafe,
		cache = ctx.$syncLinkCache.get(link);

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
		modsProp = getFullModsProp(ctx),
		mods = {...oldComponent.mods};

	for (let keys = Object.keys(mods), i = 0; i < keys.length; i++) {
		const
			key = keys[i];

		if (ctx.sync.syncModCache[key]) {
			delete mods[key];
		}
	}

	if (Object.fastCompare(modsProp, getFullModsProp(oldComponent))) {
		l.sync(mods);

	} else {
		l.sync(Object.assign(mods, modsProp));
	}
}

/**
 * Initializes the component modifiers
 * @param component
 */
export function initMods(component: iBlock): ModsNTable {
	const
		ctx = component.unsafe,
		declMods = ctx.meta.component.mods;

	const
		attrMods = <string[][]>[],
		modVal = (val) => val != null ? String(val) : undefined;

	for (let attrs = ctx.$attrs, keys = Object.keys(attrs), i = 0; i < keys.length; i++) {
		const
			key = keys[i],
			modKey = key.camelize(false);

		if (modKey in declMods) {
			const attrVal = attrs[key];
			attrs[key] = undefined;

			ctx.watch(`$attrs.${key}`, (val: Dictionary = {}) => {
				ctx.$el?.removeAttribute(key);
				void ctx.setMod(modKey, modVal(val[key]));
			});

			if (attrVal == null) {
				continue;
			}

			attrMods.push([modKey, attrVal]);
		}
	}

	function link(propMods: CanUndef<ModsTable>): ModsNTable {
		const
			mods = Object.isDictionary(ctx.mods) ? ctx.mods : {...declMods};

		if (propMods != null) {
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
			{experiments} = ctx.r.remoteState;

		if (Object.isArray(experiments)) {
			for (let i = 0; i < experiments.length; i++) {
				const
					el = experiments[i],
					experimentMods = el.meta?.mods;

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

			if (ctx.hook !== 'beforeDataCreate') {
				void ctx.setMod(key, val);
			}
		}

		return mods;
	}

	return Object.cast(ctx.sync.link(link));
}

/**
 * Returns a dictionary with watchable modifiers
 * @param component
 */
export function getWatchableMods(component: iBlock): Readonly<ModsNTable> {
	const
		watchMods = {},
		watchers = component.field.get<ModsNTable>('watchModsStore')!,
		systemMods = component.mods;

	for (let keys = Object.keys(systemMods), i = 0; i < keys.length; i++) {
		const
			key = keys[i];

		if (key in watchers) {
			watchMods[key] = systemMods[key];

		} else {
			Object.defineProperty(watchMods, key, {
				configurable: true,
				enumerable: true,
				get: () => {
					if (!(key in watchers)) {
						Object.getPrototypeOf(watchers)[key] = systemMods[key];
					}

					return watchers[key];
				}
			});
		}
	}

	return Object.freeze(watchMods);
}
