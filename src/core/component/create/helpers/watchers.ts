/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { GLOBAL } from 'core/env';
import { getFieldRealInfo, ComponentInterface } from 'core/component';

export const
	customWatcherRgxp = /^([!?]?)([^!?:]*):(.*)/,
	systemWatchers = new WeakMap<ComponentInterface, Dictionary<{cb: Set<Function>}>>();

const watcherHooks = {
	beforeDataCreate: true,
	created: true,
	mounted: true
};

/**
 * Binds watchers to the specified component
 * (very critical for loading time)
 *
 * @param ctx - component context
 * @param [eventCtx] - event component context
 */
export function bindWatchers(ctx: ComponentInterface, eventCtx: ComponentInterface = ctx): void {
	const
		// @ts-ignore (access)
		{meta, hook, $async: $a} = ctx;

	if (!watcherHooks[hook]) {
		return;
	}

	const
		isCreated = hook === 'created',
		isMounted = hook === 'mounted';

	for (let o = meta.watchers, keys = Object.keys(o), i = 0; i < keys.length; i++) {
		let
			key = keys[i];

		const
			watchers = o[key];

		if (!watchers) {
			continue;
		}

		let
			root = <any>ctx,
			onCreated = true,
			onMounted = false;

		const
			customWatcher = customWatcherRgxp.exec(key);

		if (customWatcher) {
			const m = customWatcher[1];
			onCreated = !m;
			onMounted = m === '?';
		}

		const exec = () => {
			if (customWatcher) {
				const l = customWatcher[2];
				root = l ? Object.get(eventCtx, l) || Object.get(GLOBAL, l) || ctx : ctx;
				key = l ? customWatcher[3].toString() : customWatcher[3].dasherize();
			}

			for (let i = 0; i < watchers.length; i++) {
				const
					watchObj = watchers[i],
					handlerIsStr = Object.isString(watchObj.handler);

				const label = `[[WATCHER:${key}:${
					watchObj.method != null ? watchObj.method : handlerIsStr ? watchObj.handler : (<Function>watchObj.handler).name
				}]]`;

				const
					group = {group: watchObj.group || 'watchers', label},
					eventParams = {...group, options: watchObj.options, single: watchObj.single};

				let handler = (...args) => {
					args = watchObj.provideArgs === false ? [] : args;

					if (Object.isString(watchObj.handler)) {
						const
							method = <string>watchObj.handler;

						if (!Object.isFunction(ctx[method])) {
							throw new ReferenceError(`The specified method (${method}) for watching is not defined`);
						}

						// @ts-ignore (access)
						ctx.$async.setImmediate(
							() => ctx[method](...args),
							group
						);

					} else {
						const
							fn = <Function>watchObj.handler;

						if (watchObj.method) {
							fn.call(ctx, ...args);

						} else {
							fn(ctx, ...args);
						}
					}
				};

				if (watchObj.wrapper) {
					handler = <typeof handler>watchObj.wrapper(ctx, handler);
				}

				if (handler instanceof Promise) {
					$a.promise<typeof handler>(<any>handler, group).then((handler) => {
						if (customWatcher) {
							const
								needDefEmitter = root === ctx && !Object.isFunction(root.on) && !Object.isFunction(root.addListener);

							if (needDefEmitter) {
								// @ts-ignore (access)
								ctx.$on(key, handler);

							} else {
								$a.on(root, key, handler, eventParams, ...(watchObj.args || []));
							}

							return;
						}

						const info = getFieldRealInfo(ctx, key);
						key = info.name;

						if (info.type === 'system') {
							let
								watchers = systemWatchers.get(ctx);

							if (!watchers) {
								watchers = {};
								systemWatchers.set(ctx, watchers);
							}

							let
								watcher = watchers[key],
								store = ctx[key];

							if (!watcher) {
								watcher = watchers[key] = {
									cb: new Set()
								};

								const
									cbs = watcher.cb;

								Object.defineProperty(ctx, key, {
									enumerable: true,
									configurable: true,
									get: () => store,
									set: (val) => {
										if (val === store) {
											return;
										}

										const old = store;
										store = val;

										for (let o = cbs.values(), el = o.next(); !el.done; el = o.next()) {
											el.value(val, old);
										}
									}
								});
							}

							watcher.cb.add(handler);
							watchObj.immediate && handler(store);

						} else {
							// @ts-ignore (access)
							const unwatch = ctx.$watch(key, {
								deep: watchObj.deep,
								immediate: watchObj.immediate,
								handler
							});

							$a.worker(unwatch, group);
						}
					});

				} else {
					if (customWatcher) {
						const
							needDefEmitter = root === ctx && !Object.isFunction(root.on) && !Object.isFunction(root.addListener);

						if (needDefEmitter) {
							// @ts-ignore (access)
							ctx.$on(key, handler);

						} else {
							$a.on(root, key, handler, eventParams, ...(watchObj.args || []));
						}

						continue;
					}

					const info = getFieldRealInfo(ctx, key);
					key = info.name;

					if (info.type === 'system') {
						let
							watchers = systemWatchers.get(ctx);

						if (!watchers) {
							watchers = {};
							systemWatchers.set(ctx, watchers);
						}

						let
							watcher = watchers[key],
							store = ctx[key];

						if (!watcher) {
							watcher = watchers[key] = {
								cb: new Set()
							};

							const
								cbs = watcher.cb;

							Object.defineProperty(ctx, key, {
								enumerable: true,
								configurable: true,
								get: () => store,
								set: (val) => {
									if (val === store) {
										return;
									}

									const old = store;
									store = val;

									for (let o = cbs.values(), el = o.next(); !el.done; el = o.next()) {
										el.value(val, old);
									}
								}
							});
						}

						watcher.cb.add(handler);
						watchObj.immediate && handler(store);

					} else {
						// @ts-ignore (access)
						const unwatch = ctx.$watch(key, {
							deep: watchObj.deep,
							immediate: watchObj.immediate,
							handler
						});

						$a.worker(unwatch, group);
					}
				}
			}
		};

		if (!onCreated && !isCreated || !onMounted && !isMounted) {
			meta.hooks[onMounted ? 'mounted' : 'created'].unshift({fn: exec});
			continue;
		}

		exec();
	}
}
