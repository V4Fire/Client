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
 * Initializes accessors and computed fields from the specified component instance
 * @param component
 */
export function initAccessors(component: ComponentInterface): void {
	const
		// @ts-ignore (access)
		{meta} = component;

	for (let o = meta.accessors, keys = Object.keys(o), i = 0; i < keys.length; i++) {
		const
			key = keys[i],
			el = o[key];

		if (el) {
			Object.defineProperty(component, keys[i], {
				configurable: true,
				enumerable: true,
				get: el.get,
				set: el.set
			});
		}
	}

	for (let o = meta.computedFields, keys = Object.keys(o), i = 0; i < keys.length; i++) {
		const
			key = keys[i],
			el = o[key];

		if (el) {
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
}
