/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { defProp } from 'core/const/props';
import type { ComponentMeta } from 'core/component/interface';

/**
 * Iterates over a prototype of a component constructor and adds methods/accessors to the passed meta object
 *
 * @param meta
 * @param [constructor]
 */
export function addMethodsToMeta(meta: ComponentMeta, constructor: Function = meta.constructor): void {
	const
		proto = constructor.prototype,
		ownProps = Object.getOwnPropertyNames(proto);

	const {
		componentName: src,
		props,
		fields,
		computedFields,
		systemFields,
		accessors,
		methods
	} = meta;

	for (let i = 0; i < ownProps.length; i++) {
		const
			key = ownProps[i];

		if (key === 'constructor') {
			continue;
		}

		const
			desc = Object.getOwnPropertyDescriptor(proto, key);

		if (desc == null) {
			continue;
		}

		// Methods
		if ('value' in desc) {
			const
				fn = desc.value;

			if (!Object.isFunction(fn)) {
				continue;
			}

			methods[key] = Object.assign(methods[key] ?? {watchers: {}, hooks: {}}, {src, fn});

		// Accessors
		} else {
			const
				propKey = `${key}Prop`,
				storeKey = `${key}Store`;

			let
				metaKey;

			// Computed fields are cached by default
			if (
				key in computedFields ||
				!(key in accessors) && (props[propKey] || fields[storeKey] || systemFields[storeKey])
			) {
				metaKey = 'computedFields';

			} else {
				metaKey = 'accessors';
			}

			let
				field;

			if (props[key] != null) {
				field = props;

			} else if (fields[key] != null) {
				field = fields;

			} else {
				field = systemFields;
			}

			const
				obj = meta[metaKey];

			// If we already have a property by this key, like a prop or field,
			// we need to delete it to correct override
			if (field[key] != null) {
				Object.defineProperty(proto, key, defProp);
				delete field[key];
			}

			const
				old = obj[key],
				// eslint-disable-next-line @typescript-eslint/unbound-method
				set = desc.set ?? old?.set,
				// eslint-disable-next-line @typescript-eslint/unbound-method
				get = desc.get ?? old?.get;

			// To use `super` within a setter we also create a method with a name `${key}Setter`
			if (set != null) {
				const
					k = `${key}Setter`;

				proto[k] = set;
				meta.methods[k] = {
					src,
					fn: set,
					watchers: {},
					hooks: {}
				};
			}

			// To using `super` within a getter we also create a method with a name `${key}Getter`
			if (get != null) {
				const
					k = `${key}Getter`;

				proto[k] = get;
				meta.methods[k] = {
					src,
					fn: get,
					watchers: {},
					hooks: {}
				};
			}

			obj[key] = Object.assign(obj[key] ?? {}, {
				src,
				// eslint-disable-next-line @typescript-eslint/unbound-method
				get: desc.get ?? old?.get,
				set
			});
		}
	}
}
