/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { EventEmitterLike } from 'core/async';
import { getPropertyInfo } from 'core/component/reflection';

import { beforeHooks } from 'core/component/const';
import { customWatcherRgxp } from 'core/component/watch/const';

import { ComponentInterface } from 'core/component/interface';
import { BindRemoteWatchersParams } from 'core/component/watch/interface';

/**
 * Binds watchers and event listeners that were registered as remote to the specified component instance.
 * This method have some "copy-paste" chunks, but it's done for better performance, because it's a very hot function.
 *
 * Basically, this function takes watchers from a meta property of a component,
 * but you can provide custom watchers to initialize by using the second parameter of the function.
 *
 * @param component - component instance
 * @param [params] - additional parameters
 */
export function bindRemoteWatchers(component: ComponentInterface, params?: BindRemoteWatchersParams): void {
	const
		p = params || {};

	const
		// @ts-ignore (access)
		{$watch, meta, hook, meta: {hooks}} = component,

		// Link to the self component async instance
		// @ts-ignore (access)
		selfAsync = component.$async,

		// Link to an async instance
		$a = p.async || selfAsync;

	const
		// True if the component is deactivated right now
		isDeactivated = hook === 'deactivated',

		// True if the component isn't created yet
		isBeforeCreate = beforeHooks[hook];

	const
		watchersMap = p.watchers || meta.watchers,

		// True if the method was invoked with passing custom async instance as a property
		// @ts-ignore (access)
		customAsync = $a !== component.$async;

	// Iterate over all registered watchers and listeners and initialize their
	for (let keys = Object.keys(watchersMap), i = 0; i < keys.length; i++) {
		let
			key = keys[i];

		const
			watchers = watchersMap[key];

		if (!watchers) {
			continue;
		}

		let
			// Link to a context of the watcher,
			// by default it is a component that is passed to the function
			watcherCtx = component,

			// True if this watcher can initialize only when component is created
			watcherNeedCreated = true,

			// True if this watcher can initialize only when component is mounted
			watcherNeedMounted = false;

		// Custom watchers looks like ':foo', 'bla:foo', '?bla:foo'
		// and uses to listen some events instead listen of changing of component fields
		const customWatcher = customWatcherRgxp.exec(key);

		if (customWatcher) {
			const m = customWatcher[1];
			watcherNeedCreated = !m;
			watcherNeedMounted = m === '?';
		}

		const exec = () => {
			// If we have a custom watcher we need to find a link to an event emitter.
			// For instance:
			// ':foo' -> watcherCtx == ctx; key = 'foo'
			// 'document:foo' -> watcherCtx == document; key = 'foo'
			if (customWatcher) {
				const l = customWatcher[2];
				watcherCtx = l ? Object.get(component, l) || Object.get(globalThis, l) || component : component;
				key = l ? customWatcher[3].toString() : customWatcher[3].dasherize();
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
					if (!asyncParams.label) {
						let
							defLabel;

						if (watchInfo.method != null) {
							defLabel = `[[WATCHER:${key}:${watchInfo.method}]]`;

						} else if (Object.isString(watchInfo.handler)) {
							defLabel = `[[WATCHER:${key}:${watchInfo.handler}]]`;

						} else {
							defLabel = `[[WATCHER:${key}:${(<Function>watchInfo.handler).name}]]`;
						}

						asyncParams.label = defLabel;
					}

					asyncParams.group = asyncParams.group || 'watchers';
				}

				const eventParams = {
					...asyncParams,
					options: watchInfo.options,
					single: watchInfo.single
				};

				let
					handler;

				// Right now we need to create a wrapper for our "raw" handler,
				// because there are some conditions for our watcher:
				// 1. it can provide or not provide arguments from an event that it listen;
				// 2. the handler can be specified as a function or as a method name from a component.

				// Also, we have two different cases:
				// 1. we listen to custom event, OR we watch for some component property,
				// but we don't need to analyze the old value of the property;
				// 2. we watch for some component property and we need to analyze the old value of the property.

				// These cases is based on one problem: if we watch for some property that isn't primitive,
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

				// To fix this problem we can check a handler if it requires the second argument by using a length property,
				// and if the argument is really needed, we can clone the old value and keep it within a closure.

				// The situation when we need to keep the old value (a property watcher with handler length more than one),
				// or we don't care about it (an event listener).
				if (customWatcher || !Object.isFunction(rawHandler) || rawHandler.length > 1) {
					handler = (a, b, ...args) => {
						args = watchInfo.provideArgs === false ? [] : [a, b].concat(args);

						if (Object.isString(rawHandler)) {
							if (!Object.isFunction(component[rawHandler])) {
								throw new ReferenceError(`The specified method "${rawHandler}" to watch is not defined`);
							}

							if (asyncParams.label) {
								$a.setImmediate(() => component[rawHandler](...args), asyncParams);

							} else {
								component[rawHandler](...args);
							}

						} else {
							if (watchInfo.method) {
								rawHandler.call(component, ...args);

							} else {
								rawHandler(component, ...args);
							}
						}
					};

					// The situation for a property watcher when we define the standard length of one argument
				} else {
					// tslint:disable-next-line:only-arrow-functions
					handler = function (val?: unknown): void {
						// We can safely refers to the second argument without increasing of the handler length by using arguments
						const oldVal = arguments[1];

						const
							args = watchInfo.provideArgs === false ? [] : [val, oldVal];

						if (Object.isString(rawHandler)) {
							if (!Object.isFunction(component[rawHandler])) {
								throw new ReferenceError(`The specified method "${rawHandler}" to watch is not defined`);
							}

							if (asyncParams.label) {
								$a.setImmediate(() => component[rawHandler](...args), asyncParams);

							} else {
								component[rawHandler](...args);
							}

						} else {
							if (watchInfo.method) {
								rawHandler.call(component, ...args);

							} else {
								rawHandler(component, ...args);
							}
						}
					};
				}

				// Apply a watcher wrapper if it specified.
				// Mind that the wrapper must returns a function as the result,
				// but it can be packed to a promise.
				if (watchInfo.wrapper) {
					handler = <typeof handler>watchInfo.wrapper(component, handler);
				}

				// To improve initialization performance, we should separately handle the promise situation
				// ("copy-paste", but works better)
				if (handler instanceof Promise) {
					$a.promise(handler, asyncParams).then((handler) => {
						if (customWatcher) {
							// True if an event can be listen by using the component itself,
							// because the watcherCtx doesn't look like an event emitter
							const needDefEmitter =
								watcherCtx === component &&

								// tslint:disable-next-line:no-string-literal
								!Object.isFunction(watcherCtx['on']) &&

								// tslint:disable-next-line:no-string-literal
								!Object.isFunction(watcherCtx['addListener']);

							if (needDefEmitter) {
								// @ts-ignore (access)
								component.$on(key, handler);

							} else {
								$a.on(<EventEmitterLike>watcherCtx, key, handler, eventParams, ...(watchInfo.args || []));
							}

							return;
						}

						const unwatch = $watch.call(component, p.info || getPropertyInfo(key, component), {
							deep: watchInfo.deep,
							immediate: watchInfo.immediate
						}, handler);

						unwatch && $a.worker(unwatch, asyncParams);
					});

				} else {
					if (customWatcher) {
						// True if an event can be listen by using the component itself,
						// because the watcherCtx doesn't look like an event emitter
						const needDefEmitter =
							watcherCtx === component &&

							// tslint:disable-next-line:no-string-literal
							!Object.isFunction(watcherCtx['on']) &&

							// tslint:disable-next-line:no-string-literal
							!Object.isFunction(watcherCtx['addListener']);

						if (needDefEmitter) {
							// @ts-ignore (access)
							component.$on(key, handler);

						} else {
							$a.on(<EventEmitterLike>watcherCtx, key, handler, eventParams, ...(watchInfo.args || []));
						}

						continue;
					}

					const unwatch = $watch.call(component, p.info || getPropertyInfo(key, component), {
						deep: watchInfo.deep,
						immediate: watchInfo.immediate
					}, handler);

					unwatch && $a.worker(unwatch, asyncParams);
				}
			}
		};

		// Add listener to a component created hook if the component isn't created yet
		if (watcherNeedCreated && isBeforeCreate) {
			hooks.created.unshift({fn: exec});
			continue;
		}

		// Add listener to a component mounted/activated hook if the component isn't mounted yet
		if (watcherNeedMounted && (isBeforeCreate || !component.$el)) {
			hooks[isDeactivated ? 'activated' : 'mounted'].unshift({fn: exec});
			continue;
		}

		exec();
	}
}
