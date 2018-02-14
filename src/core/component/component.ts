/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Vue, { ComponentOptions } from 'vue';
import { ComponentMeta } from 'core/component';

export interface ComponentConstructor<T = any> {
	new(): T;
}

export function getComponent(constructor: ComponentConstructor, meta: ComponentMeta): ComponentOptions<Vue> {
	const
		{mods, component, instance} = getBaseComponent(constructor, meta),
		p = meta.params;

	return <any>{
		...p.mixins,
		...component,

		provide: p.provide,
		inject: p.inject,

		data(): Dictionary {
			const
				data = {} as Dictionary;

			for (let o = meta.fields, keys = Object.keys(o), i = 0; i < keys.length; i++) {
				const
					key = this._activeField = keys[i],
					el = o[key];

				let val;
				if (el.init) {
					val = el.init(this, instance);
				}

				// tslint:disable-next-line
				if (val === undefined) {
					data[key] = el.default !== undefined ? el.default : Object.fastClone(instance[key]);

				} else {
					data[key] = val;
				}
			}

			data.mods = mods;
			return data;
		},

		beforeCreate(): void {
			for (let o = meta.accessors, keys = Object.keys(o), i = 0; i < keys.length; i++) {
				const
					key = keys[i],
					el = o[key];

				Object.defineProperty(this, keys[i], {
					get: el.get,
					set: el.set
				});
			}
		},

		created(): void {
		}
	};
}

/**
 * Returns a base component object from the specified constructor
 *
 * @param constructor
 * @param meta
 */
function getBaseComponent(
	constructor: ComponentConstructor,
	meta: ComponentMeta
): {
	mods: Dictionary<string | undefined>;
	component: ComponentMeta['component'];
	instance: Dictionary;
} {
	addMethodsToMeta(constructor, meta);

	const
		{component} = meta,
		instance = new constructor();

	for (let o = meta.props, keys = Object.keys(meta.props), i = 0; i < keys.length; i++) {
		const
			key = keys[i],
			el = o[key];

		component.props[key] = {
			type: el.type,
			required: el.required,
			validator: el.validator,
			default: el.default !== undefined ? el.default : Object.fastClone(instance[key])
		};
	}

	const
		mods = {};

	for (let o = meta.mods, keys = Object.keys(o), i = 0; i < keys.length; i++) {
		const
			key = keys[i],
			mod = o[key];

		let def;
		if (mod) {
			for (let i = 0; i < mod.length; i++) {
				const
					el = mod[i];

				if (Object.isArray(el)) {
					def = el;
					break;
				}
			}

			mods[key] = def ? String(def[0]) : undefined;
		}
	}

	return {mods, component, instance};
}

/**
 * Iterates the specified constructor prototype and adds methods/accessors to the meta object
 *
 * @param constructor
 * @param meta
 */
function addMethodsToMeta(constructor: Function, meta: ComponentMeta): void {
	const
		{component, watchers, hooks} = meta;

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
			desc = <PropertyDescriptor>Object.getOwnPropertyDescriptor(proto, key);

		if ('value' in desc) {
			component.methods[key] = desc.value;

			// tslint:disable-next-line
			const method = meta.methods[key] = Object.assign(meta.methods[key] || {}, {
				fn: desc.value
			});

			for (let o = method.watchers, keys = Object.keys(o), i = 0; i < keys.length; i++) {
				const
					key = keys[i],
					el = o[key];

				watchers[key] = watchers[key] || [];
				watchers[key].push({
					deep: el.deep,
					immediate: el.immediate,
					handler: method.fn
				});
			}

			for (let o = method.hooks, keys = Object.keys(o), i = 0; i < keys.length; i++) {
				const key = keys[i];
				hooks[key] = hooks[key] || [];
				hooks[key].push({fn: method.fn, after: o[key].after});
			}

		} else {
			const
				metaKey = key in meta.accessors ? 'accessors' : 'computed',
				obj = meta[metaKey];

			const
				old = obj[key],
				set = desc.set || old && old.set;

			if (set) {
				meta.methods[`${key}Setter`] = {
					fn: set,
					watchers: {},
					hooks: {}
				};
			}

			Object.assign(obj, {
				[key]: {
					get: desc.get || old && old.get,
					set
				}
			});

			if (metaKey === 'computed') {
				const method = obj[key];
				component.computed[key] = {
					get: method.get,
					set: method.set
				};
			}
		}
	}
}
