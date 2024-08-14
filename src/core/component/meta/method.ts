/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { defProp } from 'core/const/props';
import type { ComponentMeta } from 'core/component/interface';

const ALREADY_PASSED = Symbol('This target is passed');

/**
 * Loops through the prototype of the passed component constructor and
 * adds methods and accessors to the specified metaobject
 *
 * @param meta
 * @param [constructor]
 */
export function addMethodsToMeta(meta: ComponentMeta, constructor: Function = meta.constructor): void {
	// For smart components, this method can be called more than once
	if (constructor.hasOwnProperty(ALREADY_PASSED)) {
		return;
	}

	Object.defineProperty(constructor, ALREADY_PASSED, {value: true});

	const {
		componentName: src,
		props,
		fields,
		computedFields,
		systemFields,
		accessors,
		methods
	} = meta;

	const
		proto = constructor.prototype,
		descriptors = Object.getOwnPropertyDescriptors(proto);

	Object.entries(descriptors).forEach(([name, desc]) => {
		if (name === 'constructor') {
			return;
		}

		// Methods
		if ('value' in desc) {
			const fn = desc.value;

			if (!Object.isFunction(fn)) {
				return;
			}

			methods[name] = Object.assign(methods[name] ?? {watchers: {}, hooks: {}}, {src, fn});

		// Accessors
		} else {
			const
				propKey = `${name}Prop`,
				storeKey = `${name}Store`;

			let metaKey: string;

			// Computed fields are cached by default
			if (
				name in computedFields ||
				!(name in accessors) && (props[propKey] ?? fields[storeKey] ?? systemFields[storeKey])
			) {
				metaKey = 'computedFields';

			} else {
				metaKey = 'accessors';
			}

			let field: Dictionary;

			if (props[name] != null) {
				field = props;

			} else if (fields[name] != null) {
				field = fields;

			} else {
				field = systemFields;
			}

			const store = meta[metaKey];

			// If we already have a property by this key, like a prop or field,
			// we need to delete it to correct override
			if (field[name] != null) {
				Object.defineProperty(proto, name, defProp);
				delete field[name];
			}

			const
				old = store[name],
				set = desc.set ?? old?.set,
				get = desc.get ?? old?.get;

			// To use `super` within the setter, we also create a new method with a name `${key}Setter`
			if (set != null) {
				const nm = `${name}Setter`;
				proto[nm] = set;

				meta.methods[nm] = {
					src,
					fn: set,
					watchers: {},
					hooks: {}
				};
			}

			// To using `super` within the getter, we also create a new method with a name `${key}Getter`
			if (get != null) {
				const nm = `${name}Getter`;
				proto[nm] = get;

				meta.methods[nm] = {
					src,
					fn: get,
					watchers: {},
					hooks: {}
				};
			}

			store[name] = Object.assign(store[name] ?? {}, {
				src,
				get: desc.get ?? old?.get,
				set
			});
		}
	});
}
