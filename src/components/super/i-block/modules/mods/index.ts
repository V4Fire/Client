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
		sharedMods = initSharedMods(),
		attrMods = initAttrMods();

	return component.sync.link(link)!;

	function link(modsProp: CanUndef<ModsProp>): ModsDict {
		const isModsInitialized = Object.isDictionary(component.mods);

		const mods = isModsInitialized ? component.mods : {...declMods};

		linkSharedMods();
		linkModsProp();
		linkAttrMods();
		linkExpMods();

		return initMods();

		function initMods() {
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

		function linkSharedMods() {
			for (let i = 0; i < sharedMods.length; i++) {
				const [modName, getModValue] = sharedMods[i];

				const modVal = getModValue();

				if (isModsInitialized || modVal != null) {
					mods[modName] = modVal;
				}
			}
		}

		function linkModsProp() {
			if (modsProp != null) {
				const modNames = Object.keys(modsProp);

				for (let i = 0; i < modNames.length; i++) {
					const
						modName = modNames[i],
						modVal = modsProp[modNames[i]];

					if (modVal != null || mods[modName] == null) {
						mods[modName] = resolveModVal(modVal);
					}
				}
			}
		}

		function linkAttrMods() {
			for (let i = 0; i < attrMods.length; i++) {
				const [modName, getModValue] = attrMods[i];

				const modVal = getModValue();

				if (isModsInitialized || modVal != null) {
					mods[modName] = modVal;
				}
			}
		}

		function linkExpMods() {
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
		}
	}

	function initSharedMods() {
		const remoteMods: RemoteMods = [];

		if (!component.inheritMods) {
			return remoteMods;
		}

		const
			parent = component.$parent,
			sharedMods = parent?.sharedMods;

		if (sharedMods != null) {
			const modNames = Object.keys(sharedMods);

			for (let i = 0; i < modNames.length; i++) {
				const modName = modNames[i];

				component.watch(`$parent.mods.${modName}`, (mods: ModsDict) => {
					void component.setMod(modName, mods[modName]);
				});

				remoteMods.push([modName, () => parent!.mods[modName]]);
			}
		}

		return remoteMods;
	}

	function initAttrMods() {
		const
			remoteMods: RemoteMods = [],
			attrNames = Object.keys(component.$attrs);

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

				remoteMods.push([modName, () => resolveModVal(component.$attrs[attrName])]);
			}
		}

		component.meta.hooks['before:mounted'].push({
			fn: () => {
				el = component.$el;

				if (el instanceof Element) {
					for (let i = 0; i < remoteMods.length; i++) {
						el.removeAttribute(remoteMods[i][0]);
					}
				}
			}
		});

		return remoteMods;
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
 */
export function mergeMods(component: iBlock['unsafe'], oldComponent: iBlock['unsafe']): void {
	const
		currentModsProps = component.modsProp,
		oldModsProps = oldComponent.modsProp;

	const
		currentAttrs = component.$attrs,
		oldAttrs = oldComponent.$attrs;

	const
		currentMods = component.mods,
		oldMods = oldComponent.mods;

	const
		mergedMods = {...currentMods},
		isModsPropsPassed = currentModsProps != null && oldModsProps != null;

	const modNames = Object.keys(oldMods);

	for (let i = 0; i < modNames.length; i++) {
		const modName = modNames[i];

		const
			currentModVal = currentMods[modName],
			oldModVal = oldMods[modName];

		// True if the modifier value needs to be taken from the old component
		let shouldSetFromOld =
			currentModVal !== oldModVal &&

			// Do not merge modifiers that receive their value through `sync.mod`
			component.sync.syncModCache[modName] == null;

		if (shouldSetFromOld) {
			// If a modifier was passed through the `modsProp` prop, but the value in the prop has changed
			if (isModsPropsPassed && currentModsProps[modName] !== oldMods[modName]) {
				shouldSetFromOld = false;

			} else {
				const attrName = modName.dasherize();

				// If a modifier was passed through the component's attributes, but its value has changed
				if (currentAttrs[attrName] !== oldAttrs[attrName]) {
					shouldSetFromOld = false;
				}
			}

			if (shouldSetFromOld) {
				mergedMods[modName] = oldModVal;
			}
		}
	}

	// @ts-ignore (readonly)
	component.mods = mergedMods;
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
