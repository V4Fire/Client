/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { ComponentMeta } from 'core/component';

/**
 * Iterates the specified constructor prototype and adds methods/accessors to the meta object
 *
 * @param constructor
 * @param meta
 */
export default function addMethodsToMeta(constructor: Function, meta: ComponentMeta): void {
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
