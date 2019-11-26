/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

// tslint:disable:cyclomatic-complexity

import { ComponentMeta, ComponentParams, StrictModDeclVal } from 'core/component/interface';
import { metaPointers } from 'core/component/create/helpers/const';
export const PARENT = {};

/**
 * Inherits parameters to the specified meta object from an other object
 * and returns a new component options
 *
 * @param meta
 * @param parentMeta
 */
export default function inheritMeta(
	meta: ComponentMeta,
	parentMeta: ComponentMeta
): ComponentParams {
	let
		p = meta.params;

	const {
		params,
		props,
		fields,
		systemFields,
		mods,
		computed,
		accessors,
		methods
	} = parentMeta;

	const
		metaPointer = metaPointers[meta.componentName];

	///////////////////////////////////
	// Component parameters inheritance
	///////////////////////////////////

	p = meta.params = {
		...params,
		...p,
		name: p.name,
		model: (p.model || params.model) && {...params.model, ...p.model}
	};

	///////////////////////////
	// Props|fields inheritance
	///////////////////////////

	{
		const list = [
			[meta.props, props],
			[meta.fields, fields],
			[meta.systemFields, systemFields]
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
						watchers = watchers || new Map();
						watchers.set(val.fn, {...el.value});
					}
				}

				// @ts-ignore
				if (parent.after) {
					// @ts-ignore
					for (let a = parent.after.values(), el = a.next(); !el.done; el = a.next()) {
						after = after || new Set();
						after.add(el.value);
					}
				}

				o[key] = {...parent, after, watchers};
			}
		}
	}

	{
		const list = [
			[meta.computed, computed],
			[meta.accessors, accessors]
		];

		for (let i = 0; i < list.length; i++) {
			const
				[o, parentObj] = list[i];

			for (let keys = Object.keys(parentObj), i = 0; i < keys.length; i++) {
				const key = keys[i];
				o[key] = {...<any>parentObj[key]};
			}
		}
	}

	for (let o = meta.methods, keys = Object.keys(methods), i = 0; i < keys.length; i++) {
		const
			key = keys[i],
			parent = methods[key];

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
					after: el.after && el.after.size ? new Set(el.after) : undefined
				};
			}
		}

		o[key] = {...parent, watchers, hooks};
	}

	////////////////////////
	// Modifiers inheritance
	////////////////////////

	for (let o = meta.mods, keys = Object.keys(mods), i = 0; i < keys.length; i++) {
		const
			key = keys[i],
			current = o[key],
			parent = (mods[key] || []).slice();

		if (current) {
			const
				values = Object.createDict<StrictModDeclVal>();

			for (let o = current.slice(), i = 0; i < o.length; i++) {
				const
					el = o[i];

				if (el !== PARENT) {
					if (!(el in values) || Object.isArray(el)) {
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

					if (!(el in values)) {
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

	return p;
}
