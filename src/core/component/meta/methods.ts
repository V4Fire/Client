/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { defProp } from 'core/const/props';
import { ComponentInterface, ComponentMeta } from 'core/component';

/**
 * Iterates over a prototype of the the specified constructor and adds methods/accessors to a meta object
 *
 * @param constructor
 * @param meta
 */
export function addMethodsToMeta(constructor: Function, meta: ComponentMeta): void {
	const
		proto = constructor.prototype,
		ownProps = Object.getOwnPropertyNames(proto);

	const {
		componentName: src,
		params,
		methods,
		accessors,
		props,
		fields,
		systemFields
	} = meta;

	const
		replace = !params.flyweight;

	for (let i = 0; i < ownProps.length; i++) {
		const
			key = ownProps[i];

		if (key === 'constructor') {
			continue;
		}

		const
			desc = <PropertyDescriptor>Object.getOwnPropertyDescriptor(proto, key);

		// Methods
		if ('value' in desc) {
			const
				fn = desc.value;

			if (!Object.isFunction(fn)) {
				continue;
			}

			// tslint:disable-next-line:prefer-object-spread
			methods[key] = Object.assign(methods[key] || {replace, watchers: {}, hooks: {}}, {src, fn});

		// Accessors
		} else {
			// Computed properties are cached by default
			const metaKey = key in accessors ? 'accessors' : 'computed';

			const
				field = props[key] ? props : fields[key] ? fields : systemFields,
				obj = meta[metaKey];

			if (field[key]) {
				Object.defineProperty(proto, key, defProp);
				delete field[key];
			}

			const
				old = obj[key],
				set = desc.set || old && old.set,
				get = desc.get || old && old.get;

			// For using "super" within a setter we also create a method with a name of form `${key}Setter`
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

			// For using "super" within a getter we also create a method with a name of form `${key}Getter`
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
 * Adds methods from the specified meta object to a component
 *
 * @param meta
 * @param component
 * @param [safe] - if true, then the function uses safe access to object properties
 *   by using Object.getOwnPropertyDescriptor/defineProperty
 */
export function addMethodsFromMeta(meta: ComponentMeta, component: ComponentInterface, safe?: boolean): void {
	const list = [
		meta.accessors,
		meta.computed,
		meta.methods
	];

	const
		isFlyweight = component.$isFlyweight || meta.params.functional === true;

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
				alreadyExists = safe ? Object.getOwnPropertyDescriptor(component, key) : component[key];

			if (alreadyExists && (!isFlyweight || el.replace !== false)) {
				continue;
			}

			if ('fn' in el) {
				if (safe) {
					Object.defineProperty(component, key, {
						configurable: true,
						enumerable: true,
						writable: true,
						value: el.fn.bind(component)
					});

				} else {
					component[key] = el.fn.bind(component);
				}

			} else {
				Object.defineProperty(component, key, el);
			}
		}
	}
}
