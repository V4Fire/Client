/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { metaPointers, PARENT } from '@src/core/component/const';
import type { ComponentMeta, StrictModDeclVal } from '@src/core/component/interface';

/**
 * Inherits the specified meta object from another meta object.
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
		model: (meta.params.model || pParams.model) && {...pParams.model, ...meta.params.model},
		deprecatedProps: {...pParams.deprecatedProps, ...meta.params.deprecatedProps}
	};

	// Watcher dependencies inheritance

	if (meta.watchDependencies.size > 0) {
		for (let o = pWatchDependencies.entries(), el = o.next(); !el.done; el = o.next()) {
			const [key, pVal] = el.value;
			meta.watchDependencies.set(key, (meta.watchDependencies.get(key) ?? []).concat(pVal));
		}

	} else {
		meta.watchDependencies = new Map(pWatchDependencies.entries());
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
				[o, parentObj] = list[i];

			for (let keys = Object.keys(parentObj), i = 0; i < keys.length; i++) {
				const
					key = keys[i],
					parent = parentObj[key];

				if (!parent) {
					continue;
				}

				if (!metaPointer || !metaPointer[key]) {
					o[key] = parent;
					continue;
				}

				let
					after,
					watchers;

				if (parent.watchers) {
					for (let w = parent.watchers.values(), el = w.next(); !el.done; el = w.next()) {
						const val = el.value;
						watchers ??= new Map();
						watchers.set(val.handler, {...el.value});
					}
				}

				if ('after' in parent && parent.after) {
					for (let a = parent.after.values(), el = a.next(); !el.done; el = a.next()) {
						after ??= new Set();
						after.add(el.value);
					}
				}

				o[key] = {...parent, after, watchers};
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
				[o, parentObj] = list[i];

			for (let keys = Object.keys(parentObj), i = 0; i < keys.length; i++) {
				const key = keys[i];
				o[key] = {...parentObj[key]!};
			}
		}
	}

	// Methods inheritance

	for (let o = meta.methods, keys = Object.keys(pMethods), i = 0; i < keys.length; i++) {
		const
			key = keys[i],
			parent = pMethods[key];

		if (!parent) {
			continue;
		}

		if (!metaPointer || !metaPointer[key]) {
			o[key] = {...parent};
			continue;
		}

		const
			watchers = {},
			hooks = {};

		if (parent.watchers) {
			const
				o = parent.watchers,
				w = Object.keys(o);

			for (let i = 0; i < w.length; i++) {
				const key = w[i];
				watchers[key] = {...o[key]};
			}
		}

		if (parent.hooks) {
			const
				o = parent.hooks,
				w = Object.keys(o);

			for (let i = 0; i < w.length; i++) {
				const
					key = w[i],
					el = o[key];

				hooks[key] = {
					...el,
					after: Object.size(el.after) > 0 ? new Set(el.after) : undefined
				};
			}
		}

		o[key] = {...parent, watchers, hooks};
	}

	// Modifiers inheritance

	for (let o = meta.mods, keys = Object.keys(pMods), i = 0; i < keys.length; i++) {
		const
			key = keys[i],
			current = o[key],
			parent = (pMods[key] ?? []).slice();

		if (current) {
			const
				values = Object.createDict<StrictModDeclVal>();

			for (let o = current.slice(), i = 0; i < o.length; i++) {
				const
					el = o[i];

				if (el !== PARENT) {
					if (Object.isArray(el) || !(<string>el in values)) {
						values[String(el)] = <StrictModDeclVal>el;
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
						values[String(el)] = <StrictModDeclVal>el;
					}

					if (!parentDef && Object.isArray(el)) {
						parent[i] = el[0];
						parentDef = true;
					}
				}

				current.splice(i, 1, ...parent);
			}

			const
				valuesList = <StrictModDeclVal[]>[];

			for (let keys = Object.keys(values), i = 0; i < keys.length; i++) {
				const
					el = values[keys[i]];

				if (el !== undefined) {
					valuesList.push(el);
				}
			}

			o[key] = valuesList;

		} else if (!(key in o)) {
			o[key] = parent;
		}
	}

	return meta;
}
