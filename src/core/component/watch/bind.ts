/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { wrapWithSuspending, EventId, EventEmitterLike, EventEmitterLikeP } from 'core/async';
import { getPropertyInfo } from 'core/component/reflect';

import { beforeHooks } from 'core/component/const';
import { isCustomWatcher, customWatcherRgxp } from 'core/component/watch/const';
import { canSkipWatching } from 'core/component/watch/helpers';

import type { ComponentInterface } from 'core/component/interface';
import type { BindRemoteWatchersParams } from 'core/component/watch/interface';

/**
 * Binds watchers and event listeners,
 * added through decorators during the class description, to a specific component instance.
 *
 * Fundamentally, this function retrieves watchers from the component’s `meta` property.
 * Additionally, you can supply custom watchers as an initialization parameter
 * through the second argument of the function.
 *
 * This method contains some "copy-paste" segments,
 * which are intentionally used to enhance performance, as this is a frequently executed function.
 *
 * @param component
 * @param [params] - additional parameters
 */
export function bindRemoteWatchers(component: ComponentInterface, params?: BindRemoteWatchersParams): void {
	const p = params ?? {};

	const
		{unsafe} = component,
		{$watch, meta, hook, meta: {hooks}} = unsafe;

	const $a = p.async ?? unsafe.$async;

	const
		// True if the component is currently deactivated
		isDeactivated = hook === 'deactivated',

		// True if the component has not been created yet
		isBeforeCreate = Boolean(beforeHooks[hook]),

		// True if the method has been invoked with passing the custom async instance as a property
		isCustomAsync = $a !== unsafe.$async;

	const watchers = p.watchers ?? meta.watchers;

	// Iterate over all registered watchers and listeners and initialize their
	Object.entries(watchers).forEach(([watchPath, watchers]) => {
		if (watchers == null) {
			return;
		}

		// A link to the context of the watcher;
		// by default, a component is passed to the function
		let watcherCtx = component;

		// True if this watcher can initialize only when the component is created
		let attachWatcherOnCreated = true;

		// True if this watcher can initialize only when the component is mounted
		let attachWatcherOnMounted = false;

		// Custom watchers look like ':foo', 'bla:foo', '?bla:foo'
		// and are used to listen to custom events instead of property mutations
		const customWatcher = isCustomWatcher.test(watchPath) ? customWatcherRgxp.exec(watchPath) : null;

		if (customWatcher != null) {
			const hookMod = customWatcher[1];
			attachWatcherOnCreated = hookMod === '';
			attachWatcherOnMounted = hookMod === '?';
		}

		// Add a listener to the component's created hook if the component has not been created yet
		if (attachWatcherOnCreated && isBeforeCreate) {
			hooks['before:created'].push({fn: attachWatcher});
			return;
		}

		// Add a listener to the component's mounted/activated hook if the component has not been mounted or activated yet
		if (attachWatcherOnMounted && (isBeforeCreate || component.$el == null)) {
			hooks[isDeactivated ? 'activated' : 'mounted'].unshift({fn: attachWatcher});
			return;
		}

		attachWatcher();

		function attachWatcher() {
			// If we have a custom watcher, we need to find a link to the event emitter.
			// For instance:
			// ':foo' -> watcherCtx == ctx; key = 'foo'
			// 'document:foo' -> watcherCtx == document; key = 'foo'
			if (customWatcher != null) {
				const pathToEmitter = customWatcher[2];

				if (pathToEmitter !== '') {
					watcherCtx = Object.get(component, pathToEmitter) ?? Object.get(globalThis, pathToEmitter) ?? component;
					watchPath = customWatcher[3].toString();

				} else {
					watcherCtx = component;
					watchPath = customWatcher[3].dasherize();
				}
			}

			let propInfo: typeof p.info = p.info;

			// Iterates over all registered handlers for this watcher
			watchers!.forEach((watchInfo) => {
				if (watchInfo.shouldInit?.(component) === false) {
					return;
				}

				if (customWatcher == null) {
					propInfo ??= getPropertyInfo(watchPath, component);

					if (canSkipWatching(propInfo, watchInfo)) {
						return;
					}
				}

				const rawHandler = watchInfo.handler;

				const asyncParams = {
					group: watchInfo.group,
					label: watchInfo.label,
					join: watchInfo.join
				};

				if (!isCustomAsync) {
					if (asyncParams.label == null && !watchInfo.immediate) {
						let defLabel: string;

						if (watchInfo.method != null) {
							defLabel = `[[WATCHER:${watchPath}:${watchInfo.method}]]`;

						} else if (Object.isString(watchInfo.handler)) {
							defLabel = `[[WATCHER:${watchPath}:${watchInfo.handler}]]`;

						} else {
							defLabel = `[[WATCHER:${watchPath}:${(<Function>watchInfo.handler).name}]]`;
						}

						asyncParams.label = defLabel;
					}

					asyncParams.group = asyncParams.group ?? 'watchers';
				}

				const eventParams = {
					...asyncParams,
					options: watchInfo.options,
					single: watchInfo.single
				};

				let handler: AnyFunction;

				// Currently, we need to create a wrapper for our handler because there
				// are some conditions associated with the watcher:
				//
				// 1. It may or may doesn't provide arguments from the listened event.
				// 2. The handler can be specified either as a function or as a component method name.
				//
				// Additionally, we have two different scenarios:
				//
				// 1. We are listening to a custom event, OR we are monitoring a component property,
				//    but we don't need to analyze the old property value.
				// 2. We are monitoring a component property, and we need to analyze the old property value.
				//
				// These scenarios stem from a common issue: if we monitor a non-primitive property,
				// such as a hash table or a list,
				// and we add a new item to this structure without changing the original object,
				// the new and old values will appear the same.
				//
				// class bButton {
				//   @field()
				//   foo = {baz: 0};
				//
				//   @watch('foo')
				//   onFooChange(newVal, oldVal) {
				//     console.log(newVal === oldVal);
				//   }
				//
				//   created() {
				//     this.foo.baz++;
				//   }
				// }
				//
				// To address this issue, we can check if the handler requires a second argument by using the length property.
				// If the second argument is necessary, we can clone the old value and store it within a closure.
				//
				// This covers the situations where we need to retain the old value
				// (a property watcher with a handler length greater than one),
				// or when it is unnecessary (an event listener).
				if (customWatcher != null || !Object.isFunction(rawHandler) || rawHandler.length > 1) {
					handler = (a, b, ...args) => {
						args = watchInfo.provideArgs === false ? [] : [a, b].concat(args);

						if (Object.isString(rawHandler)) {
							if (!Object.isFunction(component[rawHandler])) {
								throw new ReferenceError(`The specified method "${rawHandler}" to watch is not defined`);
							}

							if (asyncParams.label != null) {
								$a.setImmediate(() => component[rawHandler](...args), asyncParams);

							} else {
								component[rawHandler](...args);
							}

						} else if (watchInfo.method != null) {
							rawHandler.call(component, ...args);

						} else {
							rawHandler(component, ...args);
						}
					};

				// The situation for a property watcher where we define the standard length as one argument.
				} else {
					handler = (val: unknown, ...args) => {
						const argsToProvide = watchInfo.provideArgs === false ? [] : [val, ...args];

						if (Object.isString(rawHandler)) {
							if (!Object.isFunction(component[rawHandler])) {
								throw new ReferenceError(`The specified method "${rawHandler}" to be watched is not defined`);
							}

							if (asyncParams.label != null) {
								$a.setImmediate(() => component[rawHandler](...argsToProvide), asyncParams);

							} else {
								component[rawHandler](...argsToProvide);
							}

						} else if (watchInfo.method != null) {
							rawHandler.call(component, ...argsToProvide);

						} else {
							rawHandler(component, ...argsToProvide);
						}
					};
				}

				// Apply a watcher wrapper if specified.
				// Keep in mind, the wrapper must return a function as the result, but it can be wrapped in a promise.
				if (watchInfo.wrapper) {
					handler = <typeof handler>watchInfo.wrapper(component.unsafe, handler);
				}

				// To improve initialization performance, we should handle the promise situation separately.
				// It involves "copy-paste," but it works better.
				if (Object.isPromise(handler)) {
					$a.promise(handler, asyncParams).then((handler) => {
						if (!Object.isFunction(handler)) {
							throw new TypeError('The handler to watch is not a function');
						}

						if (customWatcher) {
							const needUse$on =
								watcherCtx === component &&
								!('on' in watcherCtx) &&
								!('addListener' in watcherCtx);

							if (needUse$on) {
								unsafe.$on(watchPath, handler);

							} else {
								const addListener = (watcherCtx: ComponentInterface & EventEmitterLike) => {
									$a.on(watcherCtx, watchPath, <AnyFunction>handler, eventParams, ...watchInfo.args ?? []);
								};

								if (Object.isPromise(watcherCtx)) {
									type PromiseType = ComponentInterface & EventEmitterLike;
									$a.promise<PromiseType>(Object.cast(watcherCtx), asyncParams).then(addListener).catch(stderr);

								} else {
									addListener(watcherCtx);
								}
							}

							return;
						}

						const propInfo = p.info ?? getPropertyInfo(watchPath, component);

						if (canSkipWatching(propInfo, watchInfo)) {
							return;
						}

						/* eslint-disable prefer-const */

						let
							link: Nullable<EventId>,
							unwatch: Nullable<Function>;

						/* eslint-enable prefer-const */

						const emitter: EventEmitterLikeP = (_, wrappedHandler) => {
							handler = wrappedHandler;
							$a.worker(() => link != null && $a.off(link), asyncParams);
							return () => unwatch?.();
						};

						link = $a.on(emitter, 'mutation', handler, wrapWithSuspending(asyncParams, 'watchers'));
						unwatch = $watch.call(component, propInfo, watchInfo, handler);
					}).catch(stderr);

				} else {
					if (customWatcher) {
						const needUse$on =
							watcherCtx === component &&
							!('on' in watcherCtx) &&
							!('addListener' in watcherCtx);

						if (needUse$on) {
							unsafe.$on(watchPath, handler);

						} else {
							const addListener = (watcherCtx: ComponentInterface & EventEmitterLike) => {
								$a.on(watcherCtx, watchPath, handler, eventParams, ...watchInfo.args ?? []);
							};

							if (Object.isPromise(watcherCtx)) {
								type PromiseType = ComponentInterface & EventEmitterLike;
								$a.promise<PromiseType>(Object.cast(watcherCtx), asyncParams).then(addListener).catch(stderr);

							} else {
								addListener(watcherCtx);
							}
						}

						return;
					}

					const propInfo = p.info ?? getPropertyInfo(watchPath, component);

					if (canSkipWatching(propInfo, watchInfo)) {
						return;
					}

					/* eslint-disable prefer-const */

					let
						link: Nullable<EventId>,
						unwatch: Nullable<Function>;

					/* eslint-enable prefer-const */

					const emitter: EventEmitterLikeP = (_, wrappedHandler) => {
						handler = Object.cast(wrappedHandler);
						$a.worker(() => link != null && $a.off(link), asyncParams);
						return () => unwatch?.();
					};

					link = $a.on(emitter, 'mutation', handler, wrapWithSuspending(asyncParams, 'watchers'));
					unwatch = $watch.call(component, propInfo, watchInfo, handler);
				}
			});
		}
	});
}
