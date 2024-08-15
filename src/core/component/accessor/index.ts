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

import * as gc from 'core/component/gc';

import { deprecate } from 'core/functools/deprecation';

import { beforeHooks } from 'core/component/const';
import { cacheStatus } from 'core/component/watch';

import type { ComponentInterface } from 'core/component/interface';

/**
 * Attaches accessors and computed fields from a component's tied metaobject to the specified component instance.
 * This function creates wrappers that can cache computed field values
 * and creates accessors for deprecated component props.
 *
 * @param component
 *
 * @example
 * ```typescript
 * import iBlock, { component, prop, computed } from 'components/super/i-block/i-block';
 *
 * @component({
 *   // The following code will create an accessor for a property named "name"
 *   // that refers to "fName" and emits a warning
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
 *   // This is a cacheable computed field with the features of change watching and cache invalidation
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
 *   // This is a simple getter
 *   get element() {
 *     return this.$el;
 *   }
 * }
 * ```
 */
export function attachAccessorsFromMeta(component: ComponentInterface): void {
	const {
		async: $a,

		meta,
		// eslint-disable-next-line deprecation/deprecation
		meta: {params: {deprecatedProps}}
	} = component.unsafe;

	const isFunctional = meta.params.functional === true;

	Object.entries(meta.accessors).forEach(([name, accessor]) => {
		const canSkip =
			accessor == null ||
			component[name] != null ||
			!SSR && isFunctional && accessor.functional === false;

		if (canSkip) {
			return;
		}

		Object.defineProperty(component, name, {
			configurable: true,
			enumerable: true,
			get: accessor.get,
			set: accessor.set
		});
	});

	const cachedAccessors = new Set<Function>();

	Object.entries(meta.computedFields).forEach(([name, computed]) => {
		const canSkip =
			computed == null ||
			component[name] != null ||
			computed.cache === 'auto' ||
			!SSR && isFunctional && computed.functional === false;

		if (canSkip) {
			return;
		}

		// eslint-disable-next-line func-style
		const get = function get(this: typeof component): unknown {
			const {hook} = this;

			// If an accessor is set with `cache: true` but dependencies are not explicitly or implicitly specified,
			// then this field will be cached without the ability to reset the cache
			const canUseForeverCache = computed.dependencies == null && computed.tiedWith == null;

			// We should not use the getter's cache until the component is fully created.
			// Because until that moment, we cannot track changes to dependent entities and reset the cache when they change.
			// This can lead to hard-to-detect errors.
			// Please note that in case of forever caching, we cache immediately.
			const canUseCache = canUseForeverCache || beforeHooks[hook] == null;

			if (canUseCache && cacheStatus in get) {
				// If a getter already has a cached result and is used inside a template,
				// it is not possible to track its effect, as the value is not recalculated.
				// This can lead to a problem where one of the entities on which the getter depends is updated,
				// but the template is not.
				// To avoid this problem, we explicitly touch all dependent entities.
				// For functional components, this problem does not exist, as no change in state can trigger their re-render.
				const needEffect = !canUseForeverCache && !isFunctional && hook !== 'created';

				if (needEffect) {
					meta.watchDependencies.get(name)?.forEach((path) => {
						// @ts-ignore (effect)
						void this[path];
					});

					['Store', 'Prop'].forEach((postfix) => {
						const path = name + postfix;

						if (path in this) {
							// @ts-ignore (effect)
							void this[path];
						}
					});
				}

				return get[cacheStatus];
			}

			const value = computed.get!.call(this);

			if (canUseForeverCache || !SSR && (canUseCache || !isFunctional)) {
				cachedAccessors.add(get);
				get[cacheStatus] = value;
			}

			return value;
		};

		Object.defineProperty(component, name, {
			configurable: true,
			enumerable: true,
			get: computed.get != null ? get : undefined,
			set: computed.set
		});
	});

	// Register a worker to clean up memory upon component destruction
	$a.worker(() => {
		// eslint-disable-next-line require-yield
		gc.add(function* destructor() {
			cachedAccessors.forEach((getter) => {
				delete getter[cacheStatus];
			});

			cachedAccessors.clear();
		}());
	});

	if (deprecatedProps != null) {
		Object.entries(deprecatedProps).forEach(([name, renamedTo]) => {
			if (renamedTo == null) {
				return;
			}

			Object.defineProperty(component, name, {
				configurable: true,
				enumerable: true,
				get: () => {
					deprecate({type: 'property', name, renamedTo});
					return component[renamedTo];
				},

				set: (val) => {
					deprecate({type: 'property', name, renamedTo});
					component[renamedTo] = val;
				}
			});
		});
	}
}
