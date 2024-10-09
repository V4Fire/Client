/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { componentDecoratedKeys, PARENT } from 'core/component/const';

import type { ModDeclVal, FieldWatcher } from 'core/component/interface';
import type { ComponentMeta } from 'core/component/meta/interface';

/**
 * Inherits the specified metaobject from another one.
 * This function modifies the original object and returns it.
 *
 * @param meta
 * @param parentMeta
 */
export function inheritMeta(meta: ComponentMeta, parentMeta: ComponentMeta): ComponentMeta {
	const decoratedKeys = componentDecoratedKeys[meta.componentName];

	Object.assign(meta.tiedFields, parentMeta.tiedFields);
	Object.assign(meta.metaInitializers, parentMeta.metaInitializers);

	if (parentMeta.watchDependencies.size > 0) {
		meta.watchDependencies = new Map(parentMeta.watchDependencies);
	}

	inheritParams(meta, parentMeta);
	inheritProp(meta.props, parentMeta.props);

	inheritField(meta.fields, parentMeta.fields);
	inheritField(meta.systemFields, parentMeta.systemFields);

	inheritAccessors(meta.accessors, parentMeta.accessors);
	inheritAccessors(meta.computedFields, parentMeta.computedFields);

	inheritMethods(meta.methods, parentMeta.methods);
	Object.assign(meta.component.methods, parentMeta.component.methods);

	if (meta.params.partial == null) {
		inheritMods(meta, parentMeta);
	}

	return meta;

	function inheritProp(current: ComponentMeta['props'], parent: ComponentMeta['props']) {
		for (const [propName, parentProp] of Object.entries(parent)) {
			if (parentProp == null) {
				continue;
			}

			if (decoratedKeys == null || !decoratedKeys.has(propName)) {
				current[propName] = parentProp;
				continue;
			}

			let watchers: CanUndef<Map<FieldWatcher['handler'], FieldWatcher>>;

			parentProp.watchers?.forEach((watcher: FieldWatcher) => {
				watchers ??= new Map();
				watchers.set(watcher.handler, {...watcher});
			});

			current[propName] = {...parentProp, watchers};
		}
	}

	function inheritField(current: ComponentMeta['fields'], parent: ComponentMeta['fields']) {
		for (const [fieldName, parentField] of Object.entries(parent)) {
			if (parentField == null) {
				continue;
			}

			if (decoratedKeys == null || !decoratedKeys.has(fieldName)) {
				current[fieldName] = parentField;
				continue;
			}

			let
				after: CanUndef<Set<string>>,
				watchers: CanUndef<Map<FieldWatcher['handler'], FieldWatcher>>;

			parentField.watchers?.forEach((watcher: FieldWatcher) => {
				watchers ??= new Map();
				watchers.set(watcher.handler, {...watcher});
			});

			parentField.after?.forEach((name: string) => {
				after ??= new Set();
				after.add(name);
			});

			current[fieldName] = {...parentField, after, watchers};
		}
	}

	function inheritAccessors(current: ComponentMeta['accessors'], parent: ComponentMeta['accessors']) {
		for (const [accessorName, parentAccessor] of Object.entries(parent)) {
			current[accessorName] = {...parentAccessor!};
		}
	}

	function inheritMethods(current: ComponentMeta['methods'], parent: ComponentMeta['methods']) {
		for (const [methodName, parentMethod] of Object.entries(parent)) {
			if (parentMethod == null) {
				continue;
			}

			if (decoratedKeys == null || !decoratedKeys.has(methodName)) {
				current[methodName] = {...parentMethod};
				continue;
			}

			const
				watchers = {},
				hooks = {};

			if (parentMethod.watchers != null) {
				Object.entries(parentMethod.watchers).forEach(([key, val]) => {
					watchers[key] = {...val};
				});
			}

			if (parentMethod.hooks != null) {
				Object.entries(parentMethod.hooks).forEach(([key, hook]) => {
					hooks[key] = {
						...hook,
						after: Object.size(hook.after) > 0 ? new Set(hook.after) : undefined
					};
				});
			}

			current[methodName] = {...parentMethod, watchers, hooks};
		}
	}
}

/**
 * Inherits the `params` property for a given metaobject based on the parent one.
 * This function modifies the original object.
 *
 * @param meta
 * @param parentMeta
 */
export function inheritParams(meta: ComponentMeta, parentMeta: ComponentMeta): void {
	/* eslint-disable deprecation/deprecation */

	const
		deprecatedProps = meta.params.deprecatedProps ?? {},
		parentDeprecatedProps = parentMeta.params.deprecatedProps;

	meta.params = {
		...parentMeta.params,
		...meta.params,

		deprecatedProps,
		name: meta.params.name
	};

	if (parentDeprecatedProps != null && Object.keys(parentDeprecatedProps).length > 0) {
		meta.params.deprecatedProps = {...parentDeprecatedProps, ...deprecatedProps};
	}

	/* eslint-enable deprecation/deprecation */
}

/**
 * Inherits the `mods` property for a given metaobject based on the parent one.
 * This function modifies the original object.
 *
 * @param meta
 * @param parentMeta
 */
export function inheritMods(meta: ComponentMeta, parentMeta: ComponentMeta): void {
	const {mods} = meta;

	Object.entries(parentMeta.mods).forEach(([modName, parentModValues]) => {
		const
			currentModValues = mods[modName],
			forkedParentModValues = parentModValues?.slice() ?? [];

		if (currentModValues != null) {
			const values = Object.createDict<ModDeclVal>();

			currentModValues.slice().forEach((modVal, i) => {
				if (modVal !== PARENT) {
					const modName = String(modVal);

					if (Object.isArray(modVal) || !(modName in values)) {
						values[modName] = <Exclude<typeof modVal, {}>>modVal;
					}

					return;
				}

				const hasDefault = currentModValues.some((el) => Object.isArray(el));

				let appliedDefault = !hasDefault;

				forkedParentModValues.forEach((modVal) => {
					const modsName = String(modVal);

					if (!(modsName in values)) {
						values[modsName] = <Exclude<typeof modVal, {}>>modVal;
					}

					if (!appliedDefault && Object.isArray(modVal)) {
						forkedParentModValues[i] = modVal[0];
						appliedDefault = true;
					}
				});

				currentModValues.splice(i, 1, ...forkedParentModValues);
			});

			mods[modName] = <ModDeclVal[]>Object
				.values(values)
				.filter((val) => val !== undefined);

		} else if (!(modName in mods)) {
			mods[modName] = forkedParentModValues;
		}
	});
}
