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
 * Attaches accessors and computed fields to the specified component instance from its tied meta object.
 * The function creates cacheable wrappers for computed fields.
 * Also, it creates accessors for deprecated component props.
 *
 * @param component
 * @example
 * ```typescript
 * import iBlock, { component, prop, computed } from 'super/i-block/i-block';
 *
 * @component({
 *   // Will create an accessor for `name` that refers to `fName` and emits a warning
 *   deprecatedProps: {name: 'fName'}
 * })
 *
 * export default class bUser extends iBlock {
 *   @prop()
 *   readonly fName: string;
 *
 *   @prop()
 *   readonly lName: string;
 *
 *   // This is a cacheable computed field with feature of watching and cache invalidation
 *   @computed({cache: true, dependencies: ['fName', 'lName']})
 *   get fullName() {
 *     return `${this.fName} ${this.lName}`;
 *   }
 *
 *   // This is a cacheable computed field without cache invalidation
 *   @computed({cache: true})
 *   get id() {
 *     return Math.random();
 *   }
 *
 *   // This is a simple accessor (a getter)
 *   get element() {
 *     return this.$el;
 *   }
 * }
 * ```
 */
export function attachAccessorsFromMeta(component: ComponentInterface): void {
	const {
		meta,
		meta: {params: {deprecatedProps}}
	} = component.unsafe;

	const
		ssrMode = component.$renderEngine.supports.ssr,
		isFunctional = meta.params.functional === true;

	for (let o = meta.computedFields, keys = Object.keys(o), i = 0; i < keys.length; i++) {
		const
			key = keys[i],
			computed = o[key];

		const canSkip =
			computed == null ||
			computed.cache === 'auto' ||
			component[key] != null ||
			!ssrMode && isFunctional && computed.functional === false;

		if (canSkip) {
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

		Object.defineProperty(component, key, {
			configurable: true,
			enumerable: true,
			get: computed.get != null ? get : undefined,
			set: computed.set
		});
	}

	for (let o = meta.accessors, keys = Object.keys(o), i = 0; i < keys.length; i++) {
		const
			key = keys[i],
			accessor = o[key];

		const canSkip =
			accessor == null ||
			component[key] != null ||
			!ssrMode && isFunctional && accessor.functional === false;

		if (canSkip) {
			continue;
		}

		Object.defineProperty(component, key, {
			configurable: true,
			enumerable: true,
			get: accessor.get,
			set: accessor.set
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
