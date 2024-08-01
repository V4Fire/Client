/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:components/super/i-block/modules/mods/README.md]]
 * @packageDocumentation
 */

import type iBlock from 'components/super/i-block/i-block';
import type { ComponentInterface, ModsProp, ModsDict } from 'core/component';

export * from 'components/super/i-block/modules/mods/interface';

/**
 * Initializes the component modifiers by extracting them from the `modsProps` property,
 * attributes of the component whose names match the names of the modifiers described in the static `mods` property
 * of the component class, and the design system
 *
 * @param component
 */
export function initMods(component: iBlock): ModsDict {
	const
		ctx = component.unsafe,
		declMods = ctx.meta.component.mods;

	const
		attrMods: Array<[string, () => CanUndef<string>]> = [],
		modVal = (val: unknown) => val != null ? String(val) : undefined;

	Object.keys(ctx.$attrs).forEach((attrName) => {
		const modName = attrName.camelize(false);

		if (modName in declMods) {
			let el: Nullable<Node>;

			ctx.watch(`$attrs.${attrName}`, (attrs: Dictionary = {}) => {
				el ??= ctx.$el;

				if (el instanceof Element) {
					el.removeAttribute(attrName);
				}

				void ctx.setMod(modName, modVal(attrs[attrName]));
			});

			ctx.meta.hooks['before:mounted'].push({
				fn: () => {
					el = ctx.$el;

					if (el instanceof Element) {
						el.removeAttribute(attrName);
					}
				}
			});

			attrMods.push([modName, () => modVal(ctx.$attrs[attrName])]);
		}
	});

	function link(propMods: CanUndef<ModsProp>): ModsDict {
		const mods = Object.isDictionary(ctx.mods) ? ctx.mods : {...declMods};

		if (propMods != null) {
			Object.entries(propMods).forEach(([key, val]) => {
				if (val != null || mods[key] == null) {
					mods[key] = modVal(val);
				}
			});
		}

		attrMods.forEach(([name, getter]) => {
			mods[name] = getter();
		});

		const {experiments} = ctx.r.remoteState;

		if (Object.isArray(experiments)) {
			experiments.forEach((exp) => {
				const experimentMods = exp.meta?.mods;

				if (!Object.isDictionary(experimentMods)) {
					return;
				}

				Object.entries(experimentMods).forEach(([name, val]) => {
					if (val != null || mods[name] == null) {
						mods[name] = modVal(val);
					}
				});
			});
		}

		Object.entries(mods).forEach(([name, val]) => {
			val = modVal(mods[name]);
			mods[name] = val;

			if (ctx.hook !== 'beforeDataCreate') {
				void ctx.setMod(name, val);
			}
		});

		return mods;
	}

	return Object.cast(ctx.sync.link(link));
}

/**
 * Merges the old component modifiers with the new modifiers,
 * ensuring that the component maintains any previously applied settings while integrating new changes.
 * This function is invoked when a functional component is re-created during a re-render.
 *
 * @param component
 * @param oldComponent
 * @param name - the field name that is merged when the component is re-created (this will be `mods`)
 * @param [link] - the reference name which takes its value based on the current field
 */
export function mergeMods(
	component: iBlock,
	oldComponent: iBlock,
	name: string,
	link?: string
): void {
	if (link == null) {
		return;
	}

	const
		ctx = component.unsafe,
		cache = ctx.$syncLinkCache.get(link);

	if (cache == null) {
		return;
	}

	const l = cache[name];

	if (l == null) {
		return;
	}

	const
		modsProp = getExpandedModsProp(ctx),
		mods = {...oldComponent.mods};

	Object.keys(mods).forEach((key) => {
		if (ctx.sync.syncModCache[key]) {
			delete mods[key];
		}
	});

	if (Object.fastCompare(modsProp, getExpandedModsProp(oldComponent))) {
		l.sync(mods);

	} else {
		l.sync(Object.assign(mods, modsProp));
	}

	function getExpandedModsProp(component: ComponentInterface): ModsDict {
		const {unsafe} = component;

		if (link == null) {
			return {};
		}

		const modsProp = unsafe.$props[link];

		if (!Object.isDictionary(modsProp)) {
			return {};
		}

		const
			declMods = unsafe.meta.component.mods,
			res = <ModsDict>{...modsProp};

		Object.entries(unsafe.$attrs).forEach(([name, attr]) => {
			if (name in declMods) {
				if (attr != null) {
					res[name] = attr;
				}
			}
		});

		return res;
	}
}

/**
 * Returns a dictionary with modifiers that reactively affect the component template
 * @param component
 */
export function getReactiveMods(component: iBlock): Readonly<ModsDict> {
	const
		watchMods = {},
		watchers = component.field.get<ModsDict>('reactiveModsStore')!,
		systemMods = component.mods;

	Object.entries(systemMods).forEach(([name, val]) => {
		if (name in watchers) {
			watchMods[name] = val;

		} else {
			Object.defineProperty(watchMods, name, {
				configurable: true,
				enumerable: true,
				get: () => {
					if (!(name in watchers)) {
						Object.getPrototypeOf(watchers)[name] = val;
					}

					return watchers[name];
				}
			});
		}
	});

	return Object.freeze(watchMods);
}
