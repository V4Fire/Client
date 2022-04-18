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
import { cacheStatus } from 'core/component/watch';

import type { ComponentInterface } from 'core/component/interface';

/**
 * Attaches accessors and computed fields from a meta object to the specified component instance
 * @param component
 */
export function attachAccessorsFromMeta(component: ComponentInterface): void {
	const {
		meta,
		meta: {params: {deprecatedProps}}
	} = component.unsafe;

	const
		ssrMode = component.$renderEngine.supports.ssr,
		isFunctional = meta.params.functional === true;

	for (let o = meta.accessors, keys = Object.keys(o), i = 0; i < keys.length; i++) {
		const
			key = keys[i],
			accessor = o[key];

		if (accessor == null || component[key] != null || !ssrMode && isFunctional && accessor.functional === false) {
			continue;
		}

		Object.defineProperty(component, keys[i], {
			configurable: true,
			enumerable: true,
			get: accessor.get,
			set: accessor.set
		});
	}

	for (let o = meta.computedFields, keys = Object.keys(o), i = 0; i < keys.length; i++) {
		const
			key = keys[i],
			computed = o[key];

		if (computed == null || component[key] != null || !ssrMode && isFunctional && computed.functional === false) {
			continue;
		}

		// eslint-disable-next-line func-style
		const get = function get(this: typeof component): unknown {
			if (ssrMode) {
				return computed.get!.call(this);
			}

			if (cacheStatus in get) {
				return get[cacheStatus];
			}

			return get[cacheStatus] = computed.get!.call(this);
		};

		Object.defineProperty(component, keys[i], {
			configurable: true,
			enumerable: true,
			get: computed.get != null ? get : undefined,
			set: computed.set
		});
	}

	if (deprecatedProps != null) {
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
