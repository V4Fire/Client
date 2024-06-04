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

	const
		isFunctional = meta.params.functional === true;

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

	const
		computedFields = Object.entries(meta.computedFields);

	computedFields.forEach(([name, computed]) => {
		const canSkip =
			component[name] != null ||
			computed == null || computed.cache === 'auto' ||
			!SSR && isFunctional && computed.functional === false;

		if (canSkip) {
			return;
		}

		// eslint-disable-next-line func-style
		const get = function get(this: typeof component): unknown {
			const {hook} = this;

			if (cacheStatus in get) {
				// We should not use the getter's cache until the component is fully created,
				// because until that moment, we cannot track changes to dependent entities
				// and reset the cache when they change.
				// This can lead to hard-to-detect errors.
				// For functional components, we also should not use the cache until it is fully created.
				const canUseCache = beforeHooks[hook] == null && (!isFunctional || hook !== 'created');

				if (canUseCache) {
					// If a getter already has a cached result and is used inside a template,
					// it is not possible to track its effect, as the value is not recalculated.
					// This can lead to a problem where one of the entities on which the getter depends is updated,
					// but the template is not.
					// To avoid this problem, we explicitly touch all dependent entities.
					// For functional components, this problem does not exist, as no change in state can trigger their re-render.
					if (!isFunctional && hook !== 'created') {
						meta.watchDependencies.get(name)?.forEach((path) => {
							Object.get(this, path);
						});

						['Store', 'Prop'].forEach((postfix) => {
							const
								path = name + postfix;

							if (path in this) {
								Object.get(this, path);
							}
						});
					}

					return get[cacheStatus];
				}
			}

			const
				value = computed.get!.call(this);

			if (!SSR) {
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
		computedFields.forEach(([name]) => {
			delete Object.getOwnPropertyDescriptor(component, name)?.get?.[cacheStatus];
		});
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
