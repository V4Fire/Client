/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { getPropertyInfo } from '~/core/component/reflection';
import { wrapWithSuspending } from '~/core/async';

import { beforeHooks } from '~/core/component/const';
import { customWatcherRgxp } from '~/core/component/watch/const';

import type { ComponentInterface } from '~/core/component/interface';
import type { BindRemoteWatchersParams } from '~/core/component/watch/interface';

/**
 * Binds watchers and event listeners that were registered as remote to the specified component instance.
 * This method has some "copy-paste" chunks, but it's done for better performance because it's a very hot function.
 *
 * Basically, this function takes watchers from a meta property of the component,
 * but you can provide custom watchers to initialize by using the second parameter of the function.
 *
 * @param component
 * @param [params] - additional parameters
 */
export function bindRemoteWatchers(component: ComponentInterface, params?: BindRemoteWatchersParams): void {
	const
		p = params ?? {};

	const
		{unsafe} = component,
		{$watch, meta, hook, meta: {hooks}} = unsafe,

		// Link to the self component async instance
		selfAsync = unsafe.$async,

		// Link to an async instance
		$a = p.async ?? selfAsync;

	const
		// True if the component is deactivated right now
		isDeactivated = hook === 'deactivated',

		// True if the component isn't created yet
		isBeforeCreate = Boolean(beforeHooks[hook]);

	const
		watchersMap = p.watchers ?? meta.watchers,

		// True if the method was invoked with passing custom async instance as a property
		customAsync = $a !== unsafe.$async;

	// Iterate over all registered watchers and listeners and initialize their
	for (let keys = Object.keys(watchersMap), i = 0; i < keys.length; i++) {
		let
			watchPath = keys[i];

		const
			watchers = watchersMap[watchPath];

		if (!watchers) {
			continue;
		}

		let
			// Link to a context of the watcher,
			// by default it is a component is passed to the function
			watcherCtx = component,

			// True if this watcher can initialize only when the component is created
			watcherNeedCreated = true,

			// True if this watcher can initialize only when the component is mounted
			watcherNeedMounted = false;

		// Custom watchers looks like ':foo', 'bla:foo', '?bla:foo'
		// and uses to listen to some events instead listen of changing of component fields
		const customWatcher = customWatcherRgxp.exec(watchPath);

		if (customWatcher) {
			const m = customWatcher[1];
			watcherNeedCreated = m === '';
			watcherNeedMounted = m === '?';
		}

		const exec = () => {
			// If we have a custom watcher we need to find a link to the event emitter.
			// For instance:
			// `':foo'` -> watcherCtx == ctx; key = `'foo'`
			// `'document:foo'` -> watcherCtx == document; key = `'foo'`
			if (customWatcher) {
				const
					l = customWatcher[2];

				if (l !== '') {
					watcherCtx = Object.get<any>(component, l) ?? Object.get(globalThis, l) ?? component;
					watchPath = customWatcher[3].toString();

				} else {
					watcherCtx = component;
					watchPath = customWatcher[3].dasherize();
				}
			}

			// Iterates over all registered handlers for this watcher
			for (let i = 0; i < watchers.length; i++) {
				const
					watchInfo = watchers[i],
					rawHandler = watchInfo.handler;

				const asyncParams = {
					label: watchInfo.label,
					group: watchInfo.group,
					join: watchInfo.join
				};

				if (!customAsync) {
					if (asyncParams.label == null && !watchInfo.immediate) {
						let
							defLabel;

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

				let
					handler: AnyFunction;

				// Right now, we need to create a wrapper for our "raw" handler
				// because there are some conditions for the watcher:
				// 1. It can provide or not provide arguments from an event that it listens;
				// 2. The handler can be specified as a function or as a method name from a component.

				// Also, we have two different cases:
				// 1. We listen to a custom event, OR we watch for some component property,
				// but we don't need to analyze the old value of the property;
				// 2. We watch for some component property, and we need to analyze the old value of the property.

				// These cases are based on one problem: if we watch for some property that isn't primitive,
				// like a hash table or a list, and we add a new item to this structure but don't change the original object,
				// the new and old values will be equal.

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

				// To fix this problem, we can check a handler if it requires the second argument by using a length property,
				// and if the argument is needed, we can clone the old value and keep it within a closure.

				// The situation when we need to keep the old value (a property watcher with handler length more than one),
				// or we don't care about it (an event listener).
				if (customWatcher || !Object.isFunction(rawHandler) || rawHandler.length > 1) {
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

				// The situation for a property watcher when we define the standard length of one argument
				} else {
					handler = (val: unknown, ...args) => {
						const
							argsToProvide = watchInfo.provideArgs === false ? [] : [val, ...args];

						if (Object.isString(rawHandler)) {
							if (!Object.isFunction(component[rawHandler])) {
								throw new ReferenceError(`The specified method "${rawHandler}" to watch is not defined`);
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
				// Mind that the wrapper must return a function as a result,
				// but it can be packed to a promise.
				if (watchInfo.wrapper) {
					handler = <typeof handler>watchInfo.wrapper(component.unsafe, handler);
				}

				// To improve initialization performance, we should separately handle the promise situation
				// ("copy-paste", but works better)
				if (Object.isPromise(handler)) {
					$a.promise(handler, asyncParams).then((handler) => {
						if (!Object.isFunction(handler)) {
							throw new TypeError('A handler to watch is not a function');
						}

						if (customWatcher) {
							// True if an event can listen by using the component itself,
							// because the `watcherCtx` doesn't look like an event emitter
							const needDefEmitter =
								watcherCtx === component &&
								!Object.isFunction(watcherCtx['on']) &&
								!Object.isFunction(watcherCtx['addListener']);

							if (needDefEmitter) {
								unsafe.$on(watchPath, handler);

							} else {
								const watch = (watcherCtx) =>
									$a.on(watcherCtx, watchPath, <AnyFunction>handler, eventParams, ...watchInfo.args ?? []);

								if (Object.isPromise(watcherCtx)) {
									$a.promise(watcherCtx, asyncParams).then(watch).catch(stderr);

								} else {
									watch(watcherCtx);
								}
							}

							return;
						}

						// eslint-disable-next-line prefer-const
						let link, unwatch;

						const emitter = (_, wrappedHandler) => {
							handler = wrappedHandler;

							$a.worker(() => {
								if (link != null) {
									$a.off(link);
								}
							}, asyncParams);

							return () => unwatch?.();
						};

						link = $a.on(emitter, 'mutation', handler, wrapWithSuspending(asyncParams, 'watchers'));

						const toWatch = p.info ?? getPropertyInfo(watchPath, component);
						unwatch = $watch.call(component, toWatch, watchInfo, handler);
					}).catch(stderr);

				} else {
					if (customWatcher) {
						// True if an event can listen by using the component itself,
						// because the `watcherCtx` doesn't look like an event emitter
						const needDefEmitter =
							watcherCtx === component &&
							!Object.isFunction(watcherCtx['on']) &&
							!Object.isFunction(watcherCtx['addListener']);

						if (needDefEmitter) {
							unsafe.$on(watchPath, handler);

						} else {
							const addListener = (watcherCtx) =>
								$a.on(watcherCtx, watchPath, handler, eventParams, ...watchInfo.args ?? []);

							if (Object.isPromise(watcherCtx)) {
								$a.promise(watcherCtx, asyncParams).then(addListener).catch(stderr);

							} else {
								addListener(watcherCtx);
							}
						}

						continue;
					}

					// eslint-disable-next-line prefer-const
					let link, unwatch;

					const emitter = (_, wrappedHandler) => {
						handler = wrappedHandler;

						$a.worker(() => {
							if (link != null) {
								$a.off(link);
							}
						}, asyncParams);

						return () => unwatch?.();
					};

					link = $a.on(emitter, 'mutation', handler, wrapWithSuspending(asyncParams, 'watchers'));

					const toWatch = p.info ?? getPropertyInfo(watchPath, component);
					unwatch = $watch.call(component, toWatch, watchInfo, handler);
				}
			}
		};

		// Add listener to a component `created` hook if the component isn't created yet
		if (watcherNeedCreated && isBeforeCreate) {
			hooks.created.unshift({fn: exec});
			continue;
		}

		// Add listener to a component `mounted/activate`d hook if the component isn't mounted/activates yet
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (watcherNeedMounted && (isBeforeCreate || component.$el == null)) {
			hooks[isDeactivated ? 'activated' : 'mounted'].unshift({fn: exec});
			continue;
		}

		exec();
	}
}
