/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { GLOBAL } from 'core/const/links';
import { AsyncOpts } from 'core/async';
import { ComponentInterface, WatchOptionsWithHandler } from 'core/component/interface';

export const
	customWatcherRgxp = /^([!?]?)([^!?:]*):(.*)/;

const watcherHooks = {
	beforeCreate: true,
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
		// @ts-ignore
		{meta, meta: {props}, hook, $async: $a} = ctx;

	if (!watcherHooks[hook]) {
		return;
	}

	const
		isFunctional = meta.params.functional,
		isBeforeCreate = hook === 'beforeCreate',
		isCreated = hook === 'created',
		isMounted = hook === 'mounted';

	for (let o = meta.watchers, keys = Object.keys(o), i = 0; i < keys.length; i++) {
		let
			key = keys[i],
			onBeforeCreate = false,
			onMounted = false,
			root = <any>ctx;

		if (isFunctional && key in props) {
			continue;
		}

		const
			watchers = o[key],
			customWatcher = customWatcherRgxp.exec(key);

		if (customWatcher) {
			const
				m = customWatcher[1],
				l = customWatcher[2];

			onBeforeCreate = m === '!';
			onMounted = m === '?';

			root = l ? Object.get(eventCtx, l) || Object.get(GLOBAL, l) || ctx : ctx;
			key = l ? customWatcher[3].toString() : customWatcher[3].dasherize();
		}

		if (
			isBeforeCreate && !onBeforeCreate ||
			isCreated && (onMounted || onBeforeCreate) ||
			isMounted && !onMounted ||
			!watchers
		) {
			if (watchers) {
				const fn = () => () => {
					for (let i = 0; i < watchers.length; i++) {
						const
							el = watchers[i],
							handlerIsStr = Object.isString(el.handler);

						const label = `[[WATCHER:${key}:${
							el.method != null ? el.method : handlerIsStr ? el.handler : (<Function>el.handler).name
						}]]`;

						const
							group = {group: el.group || 'watchers', label},
							eventParams = {...group, options: el.options, single: el.single};

						let
							handler = createWatchCb(el, group, ctx);

						if (el.wrapper) {
							handler = <typeof handler>el.wrapper(ctx, handler);
						}

						if (handler instanceof Promise) {
							$a.promise<typeof handler>(<any>handler, group).then((handler) => {
								if (customWatcher) {
									const
										needDefEmitter = root === ctx && !Object.isFunction(root.on) && !Object.isFunction(root.addListener);

									if (needDefEmitter) {
										// @ts-ignore
										ctx.$on(key, handler);

									} else {
										$a.on(root, key, handler, eventParams, ...<unknown[]>el.args);
									}

									return;
								}

								const
									storeKey = `${key}Store`;

								// @ts-ignore
								const unwatch = ctx.$watch(storeKey in ctx ? storeKey : key, {
									deep: el.deep,
									immediate: el.immediate,
									handler
								});

								$a.worker(unwatch, group);
							});

						} else {
							if (customWatcher) {
								const
									needDefEmitter = root === ctx && !Object.isFunction(root.on) && !Object.isFunction(root.addListener);

								if (needDefEmitter) {
									// @ts-ignore
									ctx.$on(key, handler);

								} else {
									$a.on(root, key, handler, eventParams, ...<unknown[]>el.args);
								}

								return;
							}

							const
								storeKey = `${key}Store`;

							// @ts-ignore
							const unwatch = ctx.$watch(storeKey in ctx ? storeKey : key, {
								deep: el.deep,
								immediate: el.immediate,
								handler
							});

							$a.worker(unwatch, group);
						}
					}
				};

				meta.hooks[onMounted ? 'mounted' : 'created'].unshift({fn});
			}

			continue;
		}

		for (let i = 0; i < watchers.length; i++) {
			const
				el = watchers[i],
				handlerIsStr = Object.isString(el.handler);

			const label = `[[WATCHER:${key}:${
				el.method != null ? el.method : handlerIsStr ? el.handler : (<Function>el.handler).name
			}]]`;

			const
				group = {group: el.group || 'watchers', label},
				eventParams = {...group, options: el.options, single: el.single};

			let
				handler = createWatchCb(el, group, ctx);

			if (el.wrapper) {
				handler = <typeof handler>el.wrapper(ctx, handler);
			}

			if (handler instanceof Promise) {
				$a.promise<typeof handler>(<any>handler, group).then((handler) => {
					if (customWatcher) {
						const
							needDefEmitter = root === ctx && !Object.isFunction(root.on) && !Object.isFunction(root.addListener);

						if (needDefEmitter) {
							// @ts-ignore
							ctx.$on(key, handler);

						} else {
							$a.on(root, key, handler, eventParams, ...<unknown[]>el.args);
						}

						return;
					}

					const
						storeKey = `${key}Store`;

					// @ts-ignore
					const unwatch = ctx.$watch(storeKey in ctx ? storeKey : key, {
						deep: el.deep,
						immediate: el.immediate,
						handler
					});

					$a.worker(unwatch, group);
				});

			} else {
				if (customWatcher) {
					const
						needDefEmitter = root === ctx && !Object.isFunction(root.on) && !Object.isFunction(root.addListener);

					if (needDefEmitter) {
						// @ts-ignore
						ctx.$on(key, handler);

					} else {
						$a.on(root, key, handler, eventParams, ...<unknown[]>el.args);
					}

					return;
				}

				const
					storeKey = `${key}Store`;

				// @ts-ignore
				const unwatch = ctx.$watch(storeKey in ctx ? storeKey : key, {
					deep: el.deep,
					immediate: el.immediate,
					handler
				});

				$a.worker(unwatch, group);
			}
		}
	}
}

function createWatchCb(
	el: WatchOptionsWithHandler,
	group: AsyncOpts,
	ctx: ComponentInterface
): (...args: unknown[]) => void {
	return (...args) => {
		args = el.provideArgs === false ? [] : args;

		if (Object.isString(el.handler)) {
			const
				method = <string>el.handler;

			if (!Object.isFunction(ctx[method])) {
				throw new ReferenceError(`The specified method (${method}) for watching is not defined`);
			}

			// @ts-ignore
			ctx.$async.setImmediate(
				() => ctx[method](...args),
				group
			);

		} else {
			const
				fn = <Function>el.handler;

			if (el.method) {
				fn.call(ctx, ...args);

			} else {
				fn(ctx, ...args);
			}
		}
	};
}
