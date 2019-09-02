/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Async from 'core/async';
import { GLOBAL } from 'core/env';
import { getFieldInfo, ComponentInterface, WatchOptions, WatchOptionsWithHandler, FieldInfo } from 'core/component';

export interface BindWatchersParams<A extends object = ComponentInterface> {
	async?: Async<A>;
	watchers?: Dictionary<WatchOptionsWithHandler[]>;
	info?: FieldInfo;
}

export const
	customWatcherRgxp = /^([!?]?)([^!?:]*):(.*)/,
	systemWatchers = new WeakMap<ComponentInterface, Dictionary<{cb: Set<Function>}>>();

const beforeHooks = {
	beforeRuntime: true,
	beforeCreate: true,
	beforeDataCreate: true
};

/**
 * Clones the specified watcher value
 *
 * @param value
 * @param [params]
 */
export function cloneWatchValue<T>(value: T, params: WatchOptions = {}): T {
	if (!Object.isFrozen(value)) {
		if (Object.isArray(value)) {
			if (params.deep) {
				return Object.mixin(true, [], value);
			}

			return <any>value.slice();
		}

		if (Object.isSimpleObject(value)) {
			if (params.deep) {
				return Object.mixin(true, {}, value);
			}

			return {...value};
		}
	}

	return value;
}

/**
 * Binds watchers to the specified component
 * (very critical for loading time)
 *
 * @param ctx - component context
 * @param [watchers] - dictionary with watchers
 * @param [async] - async instance
 * @param [info] - field info object (from cache)
 */
export function bindWatchers(
	ctx: ComponentInterface,
	{watchers, async, info}: BindWatchersParams = {}
): void {
	const
		// @ts-ignore (access)
		{meta, hook, meta: {hooks}} = ctx,

		// @ts-ignore (access)
		$watch = ctx.$$watch || ctx.$watch,

		// @ts-ignore (access)
		selfAsync = ctx.$async,
		$a = async || selfAsync;

	const
		// @ts-ignore (access)
		customAsync = $a !== ctx.$async,
		isDeactivated = hook === 'deactivated',
		isBeforeCreate = beforeHooks[hook];

	for (let o = watchers || meta.watchers, keys = Object.keys(o), i = 0; i < keys.length; i++) {
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
				root = l ? Object.get(ctx, l) || Object.get(GLOBAL, l) || ctx : ctx;
				key = l ? customWatcher[3].toString() : customWatcher[3].dasherize();
			}

			for (let i = 0; i < watchers.length; i++) {
				const
					watchObj = watchers[i],
					rawHandler = watchObj.handler;

				const group = {
					label: watchObj.label,
					group: watchObj.group,
					join: watchObj.join
				};

				if (!customAsync) {
					const defLabel = `[[WATCHER:${key}:${
						watchObj.method != null ? watchObj.method : Object.isString(watchObj.handler) ?
							watchObj.handler : (<Function>watchObj.handler).name
					}]]`;

					group.label = group.label || defLabel;
					group.group = group.group || 'watchers';
				}

				const
					eventParams = {...group, options: watchObj.options, single: watchObj.single};

				let
					handler;

				if (customWatcher || !Object.isFunction(rawHandler) || rawHandler.length > 1) {
					handler = (a, b, ...args) => {
						args = watchObj.provideArgs === false ? [] : [a, b].concat(args);

						if (Object.isString(rawHandler)) {
							if (!Object.isFunction(ctx[rawHandler])) {
								throw new ReferenceError(`The specified method (${rawHandler}) for watching is not defined`);
							}

							if (group.label) {
								$a.setImmediate(
									() => ctx[rawHandler](...args),
									group
								);

							} else {
								ctx[rawHandler](...args);
							}

						} else {
							if (watchObj.method) {
								rawHandler.call(ctx, ...args);

							} else {
								rawHandler(ctx, ...args);
							}
						}
					};

				} else {
					// tslint:disable-next-line:only-arrow-functions
					handler = function (val?: unknown): void {
						const
							oldVal = arguments[1],
							args = watchObj.provideArgs === false ? [] : [val, oldVal];

						if (Object.isString(rawHandler)) {
							if (!Object.isFunction(ctx[rawHandler])) {
								throw new ReferenceError(`The specified method (${rawHandler}) for watching is not defined`);
							}

							if (group.label) {
								$a.setImmediate(
									() => ctx[rawHandler](...args),
									group
								);

							} else {
								ctx[rawHandler](...args);
							}

						} else {
							if (watchObj.method) {
								rawHandler.call(ctx, ...args);

							} else {
								rawHandler(ctx, ...args);
							}
						}
					};
				}

				if (watchObj.wrapper) {
					handler = <typeof handler>watchObj.wrapper(ctx, handler);
				}

				if (handler instanceof Promise) {
					$a.promise(handler, group).then((handler) => {
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

						const
							fieldInfo = info || getFieldInfo(key, ctx),
							fieldCtx = fieldInfo.ctx;

						if (fieldInfo.type === 'system') {
							key = fieldInfo.name;

							let
								watchers = systemWatchers.get(fieldCtx);

							if (!watchers) {
								watchers = {};
								systemWatchers.set(fieldCtx, watchers);
							}

							let
								watcher = watchers[key],
								store = fieldCtx[key];

							if (!watcher) {
								watcher = watchers[key] = {
									cb: new Set()
								};

								const
									cbs = watcher.cb;

								Object.defineProperty(fieldCtx, key, {
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

							handler = selfAsync.proxy(handler, {
								...group,
								single: false,
								onClear: () => watcher && watcher.cb.delete(handler)
							});

							watcher.cb.add(handler);
							watchObj.immediate && handler(store);

						} else if (
							fieldInfo.type !== 'prop' ||
							// @ts-ignore (access)
							!fieldCtx.meta.params.root &&
							(fieldInfo.name in (fieldCtx.$options.propsData || {}))
						) {
							const unwatch = $watch.call(ctx, fieldInfo.fullPath, {
								deep: watchObj.deep,
								immediate: watchObj.immediate,
								handler,
								fieldInfo
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

					const
						fieldInfo = info || getFieldInfo(key, ctx),
						fieldCtx = fieldInfo.ctx;

					if (fieldInfo.type === 'system') {
						key = fieldInfo.name;

						let
							watchers = systemWatchers.get(fieldCtx);

						if (!watchers) {
							watchers = {};
							systemWatchers.set(fieldCtx, watchers);
						}

						let
							watcher = watchers[key],
							store = fieldCtx[key];

						if (!watcher) {
							watcher = watchers[key] = {
								cb: new Set()
							};

							const
								cbs = watcher.cb;

							Object.defineProperty(fieldCtx, key, {
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

						handler = selfAsync.proxy(handler, {
							...group,
							single: false,
							onClear: () => watcher && watcher.cb.delete(handler)
						});

						watcher.cb.add(handler);
						watchObj.immediate && handler(store);

					} else if (
						fieldInfo.type !== 'prop' ||
						// @ts-ignore (access)
						!fieldCtx.meta.params.root &&
						(fieldInfo.name in (fieldCtx.$options.propsData || {}))
					) {
						const unwatch = $watch.call(ctx, fieldInfo.fullPath, {
							deep: watchObj.deep,
							immediate: watchObj.immediate,
							handler,
							fieldInfo
						});

						$a.worker(unwatch, group);
					}
				}
			}
		};

		if (onCreated && isBeforeCreate) {
			hooks.created.unshift({fn: exec});
			continue;
		}

		if (onMounted && (isBeforeCreate || !ctx.$el)) {
			hooks[isDeactivated ? 'activated' : 'mounted'].unshift({fn: exec});
			continue;
		}

		exec();
	}
}
