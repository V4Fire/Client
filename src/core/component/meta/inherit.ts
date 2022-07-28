/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { metaPointers, PARENT } from 'core/component/const';
import type { ComponentMeta, ModDeclVal } from 'core/component/interface';

/**
 * Inherits the specified meta object from other one.
 * The function modifies the original object and returns it.
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
		mods: pMods,
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
		deprecatedProps: {...pParams.deprecatedProps, ...meta.params.deprecatedProps}
	};

	// Watcher dependencies inheritance

	if (meta.watchDependencies.size > 0) {
		pWatchDependencies.forEach((pVal, key) => {
			meta.watchDependencies.set(key, (meta.watchDependencies.get(key) ?? []).concat(pVal));
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

		for (let i = 0; i < list.length; i++) {
			const
				[store, parentObj] = list[i];

			for (let keys = Object.keys(parentObj), i = 0; i < keys.length; i++) {
				const
					key = keys[i],
					parent = parentObj[key];

				if (parent == null) {
					continue;
				}

				if (metaPointer == null || !metaPointer[key]) {
					store[key] = parent;
					continue;
				}

				let
					after,
					watchers;

				parent.watchers?.forEach((val) => {
					watchers ??= new Map();
					watchers.set(val.handler, {...val});
				});

				if ('after' in parent) {
					parent.after?.forEach((name) => {
						after ??= new Set();
						after.add(name);
					});
				}

				store[key] = {...parent, after, watchers};
			}
		}
	}

	// Tied fields inheritance

	Object.assign(meta.tiedFields, pTiedFields);

	// Accessors inheritance

	{
		const list = [
			[meta.computedFields, pComputedFields],
			[meta.accessors, pAccessors]
		];

		for (let i = 0; i < list.length; i++) {
			const
				[store, parentObj] = list[i];

			for (let keys = Object.keys(parentObj), i = 0; i < keys.length; i++) {
				const key = keys[i];
				store[key] = {...parentObj[key]!};
			}
		}
	}

	// Methods inheritance

	for (let {methods} = meta, keys = Object.keys(pMethods), i = 0; i < keys.length; i++) {
		const
			key = keys[i],
			parent = pMethods[key];

		if (parent == null) {
			continue;
		}

		if (metaPointer == null || !metaPointer[key]) {
			methods[key] = {...parent};
			continue;
		}

		const
			watchers = {},
			hooks = {};

		if (parent.watchers != null) {
			const
				{watchers} = parent;

			for (let keys = Object.keys(watchers), i = 0; i < keys.length; i++) {
				const key = keys[i];
				watchers[key] = {...watchers[key]};
			}
		}

		if (parent.hooks != null) {
			const
				{hooks} = parent;

			for (let keys = Object.keys(hooks), i = 0; i < keys.length; i++) {
				const
					key = keys[i],
					hook = hooks[key];

				hooks[key] = {
					...hook,
					after: Object.size(hook.after) > 0 ? new Set(hook.after) : undefined
				};
			}
		}

		methods[key] = {...parent, watchers, hooks};
	}

	// Modifiers inheritance

	for (let {mods} = meta, keys = Object.keys(pMods), i = 0; i < keys.length; i++) {
		const
			key = keys[i],
			current = mods[key],
			parent = (pMods[key] ?? []).slice();

		if (current != null) {
			const
				values = Object.createDict<ModDeclVal>();

			for (let o = current.slice(), i = 0; i < o.length; i++) {
				const
					el = o[i];

				if (el !== PARENT) {
					if (Object.isArray(el) || !(<string>el in values)) {
						values[String(el)] = Object.cast(el);
					}

					continue;
				}

				let
					hasDefault = false;

				for (let i = 0; i < o.length; i++) {
					const
						el = o[i];

					if (Object.isArray(el)) {
						hasDefault = true;
						break;
					}
				}

				let
					parentDef = !hasDefault;

				for (let i = 0; i < parent.length; i++) {
					const
						el = parent[i];

					if (!(<string>el in values)) {
						values[String(el)] = Object.cast(el);
					}

					if (!parentDef && Object.isArray(el)) {
						parent[i] = el[0];
						parentDef = true;
					}
				}

				current.splice(i, 1, ...parent);
			}

			const
				valuesList: ModDeclVal[] = [];

			for (let keys = Object.keys(values), i = 0; i < keys.length; i++) {
				const
					el = values[keys[i]];

				if (el !== undefined) {
					valuesList.push(el);
				}
			}

			mods[key] = valuesList;

		} else if (!(key in mods)) {
			mods[key] = parent;
		}
	}

	return meta;
}
