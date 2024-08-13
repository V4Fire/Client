/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { metaPointers, PARENT } from 'core/component/const';
import type { ComponentMeta, ModDeclVal, FieldWatcher } from 'core/component/interface';

/**
 * Inherits the specified metaobject from another one.
 * This function modifies the original object and returns it.
 *
 * @param meta
 * @param parentMeta
 */
export function inheritMeta(
	meta: ComponentMeta,
	parentMeta: ComponentMeta
): ComponentMeta {
	const
		metaPointer = metaPointers[meta.componentName];

	const {
		params: pParams,
		props: pProps,

		fields: pFields,
		tiedFields: pTiedFields,
		computedFields: pComputedFields,
		systemFields: pSystemFields,

		accessors: pAccessors,
		methods: pMethods,
		watchDependencies: pWatchDependencies
	} = parentMeta;

	// Component parameters inheritance

	meta.params = {
		...pParams,
		...meta.params,
		name: meta.params.name,
		// eslint-disable-next-line deprecation/deprecation
		deprecatedProps: {...pParams.deprecatedProps, ...meta.params.deprecatedProps}
	};

	// Watcher dependencies inheritance

	if (meta.watchDependencies.size > 0) {
		pWatchDependencies.forEach((deps, path) => {
			meta.watchDependencies.set(path, (meta.watchDependencies.get(path) ?? []).concat(deps));
		});

	} else {
		meta.watchDependencies = new Map(pWatchDependencies);
	}

	// Props/fields inheritance

	{
		const list = [
			[meta.props, pProps],
			[meta.fields, pFields],
			[meta.systemFields, pSystemFields]
		];

		list.forEach(([store, parent]) => {
			Object.entries(parent).forEach(([key, parent]) => {
				if (parent == null) {
					return;
				}

				if (metaPointer == null || !metaPointer[key]) {
					store[key] = parent;
					return;
				}

				let
					after: CanUndef<Set<string>>,
					watchers: CanUndef<Map<FieldWatcher['handler'], FieldWatcher>>;

				parent.watchers?.forEach((watcher: FieldWatcher) => {
					watchers ??= new Map();
					watchers.set(watcher.handler, {...watcher});
				});

				if ('after' in parent) {
					parent.after?.forEach((name: string) => {
						after ??= new Set();
						after.add(name);
					});
				}

				store[key] = {...parent, after, watchers};
			});
		});
	}

	// Tied fields inheritance

	Object.assign(meta.tiedFields, pTiedFields);

	// Accessors inheritance

	{
		const list = [
			[meta.computedFields, pComputedFields],
			[meta.accessors, pAccessors]
		];

		list.forEach(([store, parentObj]) => {
			Object.entries(parentObj).forEach(([key, parent]) => store[key] = {...parent!});
		});
	}

	// Methods inheritance

	const
		{methods} = meta;

	Object.entries(pMethods).forEach(([key, parent]) => {
		if (parent == null) {
			return;
		}

		if (metaPointer == null || !metaPointer[key]) {
			methods[key] = {...parent};
			return;
		}

		const
			watchers = {},
			hooks = {};

		if (parent.watchers != null) {
			Object.entries(parent.watchers).forEach(([key, val]) => watchers[key] = {...val});
		}

		if (parent.hooks != null) {
			Object.entries(parent.hooks).forEach(([key, hook]) => {
				hooks[key] = {
					...hook,
					after: Object.size(hook.after) > 0 ? new Set(hook.after) : undefined
				};
			});
		}

		methods[key] = {...parent, watchers, hooks};
	});

	// Modifiers inheritance

	if (meta.params.partial == null) {
		inheritMods(meta, parentMeta);
	}

	return meta;
}

export function inheritMods(meta: ComponentMeta, parentMeta: ComponentMeta): void {
	const {mods: pMods} = parentMeta;

	const {mods} = meta;

	Object.keys(pMods).forEach((name) => {
		const
			currentMods = mods[name],
			parentMods = (pMods[name] ?? []).slice();

		if (currentMods != null) {
			const values = Object.createDict<ModDeclVal>();

			currentMods.slice().forEach((val, i, mods) => {
				if (val !== PARENT) {
					if (Object.isArray(val) || !(<string>val in values)) {
						values[String(val)] = Object.cast(val);
					}

					return;
				}

				let
					hasDefault = false;

				for (let i = 0; i < mods.length; i++) {
					const
						el = mods[i];

					if (Object.isArray(el)) {
						hasDefault = true;
						break;
					}
				}

				let
					parentDef = !hasDefault;

				parentMods.forEach((val) => {
					if (!(<string>val in values)) {
						values[String(val)] = Object.cast(val);
					}

					if (!parentDef && Object.isArray(val)) {
						parentMods[i] = val[0];
						parentDef = true;
					}
				});

				currentMods.splice(i, 1, ...parentMods);
			});

			const
				valuesList: ModDeclVal[] = [];

			Object.values(values).forEach((val) => {
				if (val !== undefined) {
					valuesList.push(val);
				}
			});

			mods[name] = valuesList;

		} else if (!(name in mods)) {
			mods[name] = parentMods;
		}
	});
}
