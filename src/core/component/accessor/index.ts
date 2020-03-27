/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { cacheStatus, ComponentInterface } from 'core/component';

/**
 * [[include:core/component/accessor/README.md]]
 * @packageDocumentation
 */

/**
 * Attaches accessors and computed fields from a meta object to the specified component instance
 *
 * @param component
 * @param [safe] - if true, then the function uses safe access to object properties
 *   by using Object.getOwnPropertyDescriptor/defineProperty
 */
export function attachAccessorsFromMeta(component: ComponentInterface, safe?: boolean): void {
	const
		// @ts-ignore (access)
		{meta} = component;

	const
		isFlyweight = component.$isFlyweight || meta.params.functional === true;

	for (let o = meta.accessors, keys = Object.keys(o), i = 0; i < keys.length; i++) {
		const
			key = keys[i],
			el = o[key];

		if (!el) {
			continue;
		}

		if (isFlyweight && el.functional === false) {
			continue;
		}

		const
			alreadyExists = safe ? Object.getOwnPropertyDescriptor(component, key) : component[key];

		if (alreadyExists && (!isFlyweight || el.replace !== false)) {
			continue;
		}

		Object.defineProperty(component, keys[i], {
			configurable: true,
			enumerable: true,
			get: el.get,
			set: el.set
		});
	}

	for (let o = meta.computedFields, keys = Object.keys(o), i = 0; i < keys.length; i++) {
		const
			key = keys[i],
			el = o[key];

		if (!el) {
			continue;
		}

		if (isFlyweight && el.functional === false) {
			continue;
		}

		const
			alreadyExists = safe ? Object.getOwnPropertyDescriptor(component, key) : component[key];

		if (alreadyExists && (!isFlyweight || el.replace !== false)) {
			continue;
		}

		const get = () => {
			if (cacheStatus in get) {
				return get[cacheStatus];
			}

			return get[cacheStatus] = el.get!.call(component);
		};

		Object.defineProperty(component, keys[i], {
			configurable: true,
			enumerable: true,
			get: el.get && get,
			set: el.set
		});
	}
}
