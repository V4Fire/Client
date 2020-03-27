/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { defProp } from 'core/const/props';
import { ComponentMeta } from 'core/component/interface';

/**
 * Iterates over a prototype of a component constructor and adds methods/accessors to the specified meta object
 *
 * @param meta
 * @param [constructor]
 */
export function addMethodsToMeta(meta: ComponentMeta, constructor: Function = meta.constructor): void {
	const
		proto = constructor.prototype,
		ownProps = Object.getOwnPropertyNames(proto),
		replace = !meta.params.flyweight;

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
			const
				propKey = `${key}Prop`,
				storeKey = `${key}Store`;

			let
				metaKey;

			// Computed fields are cached by default
			// tslint:disable-next-line:prefer-conditional-expression
			if (
				key in computedFields ||
				!(key in accessors) && (props[propKey] || fields[storeKey] || systemFields[storeKey])
			) {
				metaKey = 'computedFields';

			} else {
				metaKey = 'accessors';
			}

			const
				field = props[key] ? props : fields[key] ? fields : systemFields,
				obj = meta[metaKey];

			// If we already have a property by this key, like a prop or a field,
			// we need to delete it to correct override
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
