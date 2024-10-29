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
import { getPropertyInfo } from 'core/component/reflect';

import { getFieldsStore } from 'core/component/field';
import { cacheStatus } from 'core/component/watch';

import type { ComponentInterface, Hook } from 'core/component/interface';

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
		meta,

		// eslint-disable-next-line deprecation/deprecation
		meta: {params: {deprecatedProps}, tiedFields, hooks},

		$destructors
	} = component.unsafe;

	const isFunctional = meta.params.functional === true;

	// eslint-disable-next-line guard-for-in
	for (const name in meta.accessors) {
		const accessor = meta.accessors[name];

		if (accessor == null) {
			continue;
		}

		const tiedWith = tiedFields[name];

		// In the `tiedFields` dictionary,
		// the names of the getters themselves are also stored as keys with their related fields as values.
		// This is done for convenience.
		// However, watchers for the getter observation of the getter will be created for all keys in `tiedFields`.
		// Since it's not possible to watch the getter itself, we need to remove the key with its name.
		delete tiedFields[name];

		const canSkip =
			name in component ||
			!SSR && isFunctional && accessor.functional === false;

		if (canSkip) {
			// If the getter is not initialized,
			// then the related fields should also be removed to avoid registering a watcher for the getter observation,
			// as it will not be used
			if (tiedWith != null) {
				delete tiedFields[tiedWith];
			}

			continue;
		}

		let getterInitialized = false;

		// eslint-disable-next-line func-style
		const get = function get(this: typeof component): unknown {
			if (!getterInitialized) {
				getterInitialized = true;

				const {watchers, watchDependencies} = meta;

				const deps = watchDependencies.get(name);

				if (deps != null && deps.length > 0 || tiedWith != null) {
					onCreated(this.hook, () => {
						// If a computed property has a field or system field as a dependency
						// and the host component does not have any watchers to this field,
						// we need to register a "fake" watcher to enforce watching
						if (deps != null) {
							for (let i = 0; i < deps.length; i++) {
								const
									dep = deps[i],
									path = Object.isArray(dep) ? dep.join('.') : String(dep),
									info = getPropertyInfo(path, component);

								const needForceWatch =
									(info.type === 'system' || info.type === 'field') &&

									watchers[info.name] == null &&
									watchers[info.originalPath] == null &&
									watchers[info.path] == null;

								if (needForceWatch) {
									this.$watch(info, {deep: true, immediate: true}, fakeHandler);
								}
							}
						}

						if (tiedWith != null) {
							const needForceWatch = watchers[tiedWith] == null && accessor.dependencies?.length !== 0;

							// If a computed property is tied with a field or system field
							// and the host component does not have any watchers to this field,
							// we need to register a "fake" watcher to enforce watching
							if (needForceWatch) {
								this.$watch(tiedWith, {deep: true, immediate: true}, fakeHandler);
							}
						}
					});
				}
			}

			return accessor.get!.call(this);
		};

		Object.defineProperty(component, name, {
			configurable: true,
			enumerable: true,
			get: accessor.get != null ? get : undefined,
			set: accessor.set
		});
	}

	const cachedAccessors = new Set<Function>();

	// eslint-disable-next-line guard-for-in
	for (const name in meta.computedFields) {
		const computed = meta.computedFields[name];

		if (computed == null) {
			continue;
		}

		const tiedWith = tiedFields[name];

		// In the `tiedFields` dictionary,
		// the names of the getters themselves are also stored as keys with their related fields as values.
		// This is done for convenience.
		// However, watchers for cache invalidation of the getter will be created for all keys in `tiedFields`.
		// Since it's not possible to watch the getter itself, we need to remove the key with its name.
		delete tiedFields[name];

		const canSkip =
			name in component ||
			computed.cache === 'auto' ||
			!SSR && isFunctional && computed.functional === false;

		if (canSkip) {
			// If the getter is not initialized,
			// then the related fields should also be removed to avoid registering a watcher for cache invalidation,
			// as it will not be used
			if (tiedWith != null) {
				delete tiedFields[tiedWith];
			}

			continue;
		}

		const
			canUseForeverCache = computed.cache === 'forever',
			effects: Function[] = [];

		let getterInitialized = canUseForeverCache;

		// eslint-disable-next-line func-style
		const get = function get(this: typeof component): unknown {
			if (!getterInitialized) {
				getterInitialized = true;

				const {watchers, watchDependencies} = meta;

				const deps = watchDependencies.get(name);

				if (deps != null && deps.length > 0 || tiedWith != null) {
					onCreated(this.hook, () => {
						// If a computed property has a field or system field as a dependency
						// and the host component does not have any watchers to this field,
						// we need to register a "fake" watcher to enforce watching
						if (deps != null) {
							for (let i = 0; i < deps.length; i++) {
								const
									dep = deps[i],
									path = Object.isArray(dep) ? dep.join('.') : String(dep),
									info = getPropertyInfo(path, component);

								// If a getter already has a cached result and is used inside a template,
								// it is not possible to track its effect, as the value is not recalculated.
								// This can lead to a problem where one of the entities on which the getter depends is updated,
								// but the template is not.
								// To avoid this problem, we explicitly touch all dependent entities.
								// For functional components, this problem does not exist,
								// as no change in state can trigger their re-render.
								if (!isFunctional && info.type !== 'system') {
									effects.push(() => {
										const store = info.type === 'field' ? getFieldsStore(Object.cast(info.ctx)) : info.ctx;

										if (info.path.includes('.')) {
											void Object.get(store, path);

										} else if (path in store) {
											// @ts-ignore (effect)
											void store[path];
										}
									});
								}

								const needToForceWatching =
									(info.type === 'system' || info.type === 'field') &&

									watchers[info.name] == null &&
									watchers[info.originalPath] == null &&
									watchers[info.path] == null;

								if (needToForceWatching) {
									this.$watch(info, {deep: true, immediate: true}, fakeHandler);
								}
							}
						}

						if (tiedWith != null) {
							effects.push(() => {
								if (tiedWith in this) {
									// @ts-ignore (effect)
									void this[tiedWith];
								}
							});

							const needToForceWatching = watchers[tiedWith] == null && computed.dependencies?.length !== 0;

							// If a computed property is tied with a field or system field
							// and the host component does not have any watchers to this field,
							// we need to register a "fake" watcher to enforce watching
							if (needToForceWatching) {
								this.$watch(tiedWith, {deep: true, immediate: true}, fakeHandler);
							}
						}
					});
				}
			}

			// We should not use the getter's cache until the component is fully created.
			// Because until that moment, we cannot track changes to dependent entities and reset the cache when they change.
			// This can lead to hard-to-detect errors.
			// Please note that in case of forever caching, we cache immediately.
			const canUseCache = canUseForeverCache || beforeHooks[this.hook] == null;

			if (canUseCache && cacheStatus in get) {
				if (this.hook !== 'created') {
					for (let i = 0; i < effects.length; i++) {
						effects[i]();
					}
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
	}

	// Register a worker to clean up memory upon component destruction
	$destructors.push(() => {
		// eslint-disable-next-line require-yield
		gc.add(function* destructor() {
			for (const getter of cachedAccessors) {
				delete getter[cacheStatus];
			}

			cachedAccessors.clear();
		}());
	});

	if (deprecatedProps != null) {
		for (const name of Object.keys(deprecatedProps)) {
			const renamedTo = deprecatedProps[name];

			if (renamedTo == null) {
				continue;
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
		}
	}

	function fakeHandler() {
		// Loopback
	}

	function onCreated(hook: Nullable<Hook>, cb: Function) {
		if (hook == null || beforeHooks[hook] != null) {
			hooks['before:created'].push({fn: cb});

		} else {
			cb();
		}
	}
}
