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

import type { ModsProp, ModsDict } from 'core/component';

import type iBlock from 'components/super/i-block/i-block';

export * from 'components/super/i-block/modules/mods/interface';

/**
 * Initializes the component modifiers by extracting them from the `modsProps` property,
 * attributes of the component whose names match the names of the modifiers described in the static `mods` property
 * of the component class, and the design system
 *
 * @param component
 */
export function initMods(component: iBlock['unsafe']): ModsDict {
	const declMods = component.meta.component.mods;

	type RemoteMods = Array<[string, () => CanUndef<string>]>;

	const
		parentMods: RemoteMods = [],
		attrMods: RemoteMods = [];

	if (component.inheritMods) {
		initSharedMods();
	}

	initModsFromAttrs();

	return Object.cast(component.sync.link(link));

	function link(propMods: CanUndef<ModsProp>): ModsDict {
		const
			isModsInitialized = Object.isDictionary(component.mods),
			mods = isModsInitialized ? component.mods : {...declMods};

		for (let i = 0; i < parentMods.length; i++) {
			const [modName, getModValue] = parentMods[i];

			const modVal = getModValue();

			if (modVal != null) {
				mods[modName] = modVal;
			}
		}

		if (propMods != null) {
			const propNames = Object.keys(propMods);

			for (let i = 0; i < propNames.length; i++) {
				const
					propName = propNames[i],
					propVal = propMods[propNames[i]];

				if (propVal != null || mods[propName] == null) {
					mods[propName] = resolveModVal(propVal);
				}
			}
		}

		for (let i = 0; i < attrMods.length; i++) {
			const [modName, getModValue] = attrMods[i];

			const modVal = getModValue();

			if (isModsInitialized || modVal != null) {
				mods[modName] = modVal;
			}
		}

		const {experiments} = component.r.remoteState;

		if (Object.isArray(experiments)) {
			for (let i = 0; i < experiments.length; i++) {
				const
					exp = experiments[i],
					expMods = exp.meta?.mods;

				if (!Object.isDictionary(expMods)) {
					continue;
				}

				const expModNames = Object.keys(expMods);

				for (let i = 0; i < expModNames.length; i++) {
					const
						modName = expModNames[i],
						modVal = expMods[modName];

					if (modVal != null || mods[modName] == null) {
						mods[modName] = resolveModVal(modVal);
					}
				}
			}
		}

		const modNames = Object.keys(mods);

		for (let i = 0; i < modNames.length; i++) {
			const modName = modNames[i];

			const modVal = resolveModVal(mods[modName]);
			mods[modName] = modVal;

			if (component.hook !== 'beforeDataCreate') {
				void component.setMod(modName, modVal);
			}
		}

		return mods;
	}

	function initSharedMods() {
		const parent = component.$parent;

		if (parent == null) {
			return;
		}

		const {sharedMods} = parent;

		if (sharedMods == null) {
			return;
		}

		const modNames = Object.keys(sharedMods);

		for (let i = 0; i < modNames.length; i++) {
			const modName = modNames[i];

			component.watch(`$parent.mods.${modName}`, (mods: ModsDict) => {
				void component.setMod(modName, mods[modName]);
			});

			parentMods.push([modName, () => parent.mods[modName]]);
		}
	}

	function initModsFromAttrs() {
		const attrNames = Object.keys(component.$attrs);

		let el: Nullable<Node>;

		for (let i = 0; i < attrNames.length; i++) {
			const
				attrName = attrNames[i],
				modName = attrName.camelize(false);

			if (modName in declMods) {
				component.watch(`$attrs.${attrName}`, (attrs: Dictionary = {}) => {
					el ??= component.$el;

					if (el instanceof Element) {
						el.removeAttribute(attrName);
					}

					void component.setMod(modName, resolveModVal(attrs[attrName]));
				});

				parentMods.push([modName, () => resolveModVal(component.$attrs[attrName])]);
			}
		}

		component.meta.hooks['before:mounted'].push({
			fn: () => {
				el = component.$el;

				if (el instanceof Element) {
					for (let i = 0; i < parentMods.length; i++) {
						el.removeAttribute(parentMods[i][0]);
					}
				}
			}
		});
	}

	function resolveModVal(val: unknown) {
		return val != null ? String(val) : undefined;
	}
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
	component: iBlock['unsafe'],
	oldComponent: iBlock['unsafe'],
	name: string,
	link?: string
): void {
	if (link == null) {
		// @ts-ignore (readonly)
		component.mods = {...oldComponent.mods};
		return;
	}

	const cache = component.$syncLinkCache.get(link);

	if (cache == null) {
		return;
	}

	const l = cache[name];

	if (l == null) {
		return;
	}

	const
		modsProp = getExpandedModsProp(component),
		mods = {...oldComponent.mods};

	if (Object.fastCompare(modsProp, getExpandedModsProp(oldComponent))) {
		l.sync(mods);

	} else {
		l.sync(Object.assign(mods, modsProp));
	}

	function getExpandedModsProp(component: iBlock['unsafe']): ModsDict {
		if (link == null) {
			return {};
		}

		const modsProp = component[link];

		if (!Object.isDictionary(modsProp)) {
			return {};
		}

		const
			declaredMods = component.meta.component.mods,
			expandedModsProp = <ModsDict>{...modsProp};

		const attrNames = Object.keys(component.$attrs);

		for (let i = 0; i < attrNames.length; i++) {
			const attrName = attrNames[i];

			if (attrName in declaredMods) {
				const attr = component.$attrs[attrName];

				if (attr != null) {
					expandedModsProp[attrName] = attr;
				}
			}
		}

		return expandedModsProp;
	}
}

/**
 * Returns a dictionary with modifiers that reactively affect the component template
 * @param component
 */
export function getReactiveMods(component: iBlock): Readonly<ModsDict> {
	const
		watchMods = {},
		watchers = component.field.get<ModsDict>('reactiveModsStore')!;

	const modNames = Object.keys(component.mods);

	for (let i = 0; i < modNames.length; i++) {
		const
			modName = modNames[i],
			modVal = component.mods[modName];

		if (modName in watchers) {
			watchMods[modName] = modVal;

		} else {
			Object.defineProperty(watchMods, modName, {
				configurable: true,
				enumerable: true,
				get: () => {
					if (!(modName in watchers)) {
						Object.getPrototypeOf(watchers)[modName] = modVal;
					}

					return watchers[modName];
				}
			});
		}
	}

	return Object.freeze(watchMods);
}
