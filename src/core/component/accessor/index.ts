/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:core/component/accessor/README.md]]
 * @packageDocumentation
 */

import { deprecate } from 'core/functools/deprecation';
import { cacheStatus, ComponentInterface } from 'core/component';

/**
 * Attaches accessors and computed fields from a meta object to the specified component instance
 *
 * @param component
 * @param [safe] - if true, then the function uses safe access to object properties
 *   by using Object.getOwnPropertyDescriptor/defineProperty
 */
export function attachAccessorsFromMeta(component: ComponentInterface, safe?: boolean): void {
	const
		{meta, meta: {params: {deprecatedProps}}} = component.unsafe;

	const
		isFlyweight = meta.params.functional === true || component.isFlyweight;

	for (let o = meta.accessors, keys = Object.keys(o), i = 0; i < keys.length; i++) {
		const
			key = keys[i],
			el = o[key];

		if (el == null) {
			continue;
		}

		if (isFlyweight && el.functional === false) {
			continue;
		}

		const
			alreadyExists = Boolean(safe ? Object.getOwnPropertyDescriptor(component, key) : component[key]);

		if (alreadyExists && (!isFlyweight || el.replace !== false)) {
			continue;
		}

		Object.defineProperty(component, keys[i], {
			configurable: true,
			enumerable: true,

			// eslint-disable-next-line @typescript-eslint/unbound-method
			get: el.get,

			// eslint-disable-next-line @typescript-eslint/unbound-method
			set: el.set
		});
	}

	for (let o = meta.computedFields, keys = Object.keys(o), i = 0; i < keys.length; i++) {
		const
			key = keys[i],
			el = o[key];

		if (el == null) {
			continue;
		}

		if (isFlyweight && el.functional === false) {
			continue;
		}

		const
			alreadyExists = Boolean(safe ? Object.getOwnPropertyDescriptor(component, key) : component[key]);

		if (alreadyExists && (!isFlyweight || el.replace !== false)) {
			continue;
		}

		// eslint-disable-next-line func-style
		const get = function get(this: typeof component): unknown {
			if (cacheStatus in get) {
				return get[cacheStatus];
			}

			return get[cacheStatus] = el.get!.call(this);
		};

		Object.defineProperty(component, keys[i], {
			configurable: true,
			enumerable: true,

			// eslint-disable-next-line @typescript-eslint/unbound-method
			get: el.get != null ? get : undefined,

			// eslint-disable-next-line @typescript-eslint/unbound-method
			set: el.set
		});
	}

	if (deprecatedProps) {
		for (let keys = Object.keys(deprecatedProps), i = 0; i < keys.length; i++) {
			const
				key = keys[i],
				alternative = deprecatedProps[key];

			if (alternative == null) {
				continue;
			}

			Object.defineProperty(component, key, {
				configurable: true,
				enumerable: true,
				get: () => {
					deprecate({type: 'property', name: key, renamedTo: alternative});
					return component[alternative];
				},

				set: (val) => {
					deprecate({type: 'property', name: key, renamedTo: alternative});
					component[alternative] = val;
				}
			});
		}
	}
}
