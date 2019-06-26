/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { defProp } from 'core/const/props';
import { ComponentInterface, ComponentMeta } from 'core/component/interface';

/**
 * Creates a new meta object with the specified parent
 * @param parent
 */
export function createMeta(parent: ComponentMeta): ComponentMeta {
	const meta = Object.assign(Object.create(parent), {
		params: Object.create(parent.params),
		watchers: {},
		hooks: {}
	});

	for (let o = meta.hooks, p = parent.hooks, keys = Object.keys(p), i = 0; i < keys.length; i++) {
		const
			key = keys[i],
			v = p[key];

		if (v) {
			o[key] = v.slice();
		}
	}

	for (let o = meta.watchers, p = parent.watchers, keys = Object.keys(p), i = 0; i < keys.length; i++) {
		const
			key = keys[i],
			v = p[key];

		if (v) {
			o[key] = v.slice();
		}
	}

	return meta;
}

/**
 * Iterates the specified constructor prototype and adds methods/accessors to the meta object
 *
 * @param constructor
 * @param meta
 */
export function addMethodsToMeta(constructor: Function, meta: ComponentMeta): void {
	const
		proto = constructor.prototype,
		ownProps = Object.getOwnPropertyNames(proto);

	for (let i = 0; i < ownProps.length; i++) {
		const
			key = ownProps[i];

		if (key === 'constructor') {
			continue;
		}

		const
			src = meta.componentName,
			replace = !meta.params.flyweight,
			desc = <PropertyDescriptor>Object.getOwnPropertyDescriptor(proto, key);

		if ('value' in desc) {
			const
				fn = desc.value;

			if (!Object.isFunction(fn)) {
				continue;
			}

			// tslint:disable-next-line:prefer-object-spread
			meta.methods[key] = Object.assign(meta.methods[key] || {replace, watchers: {}, hooks: {}}, {src, fn});

		} else {
			const
				field = meta.props[key] ? meta.props : meta.fields[key] ? meta.fields : meta.systemFields,
				metaKey = key in meta.accessors ? 'accessors' : 'computed',
				obj = meta[metaKey];

			if (field[key]) {
				Object.defineProperty(proto, key, defProp);
				delete field[key];
			}

			const
				old = obj[key],
				set = desc.set || old && old.set,
				get = desc.get || old && old.get;

			if (set) {
				const
					k = `${key}Setter`;

				proto[k] = set;
				meta.methods[k] = {
					src,
					replace,
					fn: set,
					watchers: {},
					hooks: {}
				};
			}

			if (get) {
				const
					k = `${key}Getter`;

				proto[k] = get;
				meta.methods[k] = {
					src,
					replace,
					fn: get,
					watchers: {},
					hooks: {}
				};
			}

			// tslint:disable-next-line:prefer-object-spread
			obj[key] = Object.assign(obj[key] || {replace}, {
				src,
				get: desc.get || old && old.get,
				set
			});
		}
	}
}

/**
 * Adds methods from a meta object to the specified component
 *
 * @param meta
 * @param ctx - component context
 * @param [safe] - if true, then will be using safe access to properties
 */
export function addMethodsFromMeta(meta: ComponentMeta, ctx: ComponentInterface, safe?: boolean): void {
	const list = [
		meta.accessors,
		meta.computed,
		meta.methods
	];

	const
		isFlyweight = ctx.$isFlyweight || meta.params.functional === true;

	for (let i = 0; i < list.length; i++) {
		const
			o = list[i];

		for (let keys = Object.keys(o), i = 0; i < keys.length; i++) {
			const
				key = keys[i],
				el = <StrictDictionary<any>>o[key];

			if (isFlyweight && el.functional === false) {
				continue;
			}

			const
				alreadyExists = safe ? Object.getOwnPropertyDescriptor(ctx, key) : ctx[key];

			if (alreadyExists && (!isFlyweight || el.replace !== false)) {
				continue;
			}

			if ('fn' in el) {
				if (safe) {
					Object.defineProperty(ctx, key, {
						configurable: true,
						enumerable: true,
						writable: true,
						value: el.fn.bind(ctx)
					});

				} else {
					ctx[key] = el.fn.bind(ctx);
				}

			} else {
				Object.defineProperty(ctx, key, el);
			}
		}
	}
}

/**
 * Returns a link to the "normal" (non functional and non flyweight) parent component for the specified component
 * @param ctx - component context
 */
export function getNormalParent(ctx: ComponentInterface): CanUndef<ComponentInterface> {
	let
		normalParent: CanUndef<ComponentInterface> = ctx.$parent;

	// @ts-ignore
	while (normalParent && normalParent.meta && (normalParent.$isFlyweight || normalParent.meta.params.functional)) {
		normalParent = normalParent.$parent;
	}

	return normalParent;
}
