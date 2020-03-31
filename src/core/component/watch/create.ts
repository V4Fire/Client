/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import watch, { mute, unmute, unwrap, getProxyType } from 'core/object/watch';

import { getPropertyInfo, PropertyInfo } from 'core/component/reflection';
import { ComponentInterface, WatchOptions, RawWatchHandler } from 'core/component/interface';

import { proxyGetters } from 'core/component/engines';
import { cacheStatus, fakeCopyLabel, watcherInitializer } from 'core/component/watch/const';
import { DynamicHandlers } from 'core/component/watch/interface';
import { cloneWatchValue } from 'core/component';

/**
 * Creates a function to watch changes from the specified component instance and returns it
 *
 * @param component
 * @param dynamicHandlers - map of handlers to watch dynamic fields, like accessors and computedFields
 */
export function createWatchFn(
	component: ComponentInterface,
	dynamicHandlers: DynamicHandlers
): ComponentInterface['$watch'] {
	const
		watchCache = Object.createDict();

	return (path, optsOrHandler, rawHandler?) => {
		if (component.$isFlyweight) {
			return null;
		}

		let
			handler: RawWatchHandler,
			opts: CanUndef<WatchOptions>;

		if (Object.isFunction(optsOrHandler)) {
			handler = optsOrHandler;
			opts = {};

		} else {
			handler = rawHandler;
			opts = optsOrHandler;
		}

		const
			info: PropertyInfo = Object.isString(path) ? getPropertyInfo(path, component) : path,
			isAccessor = info.type === 'accessor' || info.type === 'computed' || info.accessor;

		const
			watchInfo = isAccessor ? null : proxyGetters[info.type]?.(info.ctx),
			proxy = watchInfo?.value;

		const
			needCache = handler.length > 1,
			ref = info.originalPath;

		let
			oldVal;

		const
			originalHandler = handler,
			getVal = () => Object.get(info.type === 'field' ? proxy : component, info.originalPath);

		if (needCache) {
			oldVal = watchCache[ref] = ref in watchCache ?
				watchCache[ref] :
				opts?.immediate || !isAccessor ? cloneWatchValue(getVal(), opts) : undefined;

			handler = (val, _, ...args) => {
				if (isAccessor) {
					val = Object.get(component, info.originalPath);
				}

				const res = originalHandler.call(this, val, oldVal, ...args);
				oldVal = watchCache[ref] = cloneWatchValue(val, opts);
				return res;
			};

			handler[cacheStatus] = originalHandler[cacheStatus];

			if (opts?.immediate) {
				handler.call(component, oldVal);
			}

		} else {
			if (isAccessor) {
				handler = (val, oldVal, ...args) => {
					val = Object.get(component, info.originalPath);
					return originalHandler.call(this, val, oldVal, ...args);
				};
			}

			if (opts?.immediate) {
				handler.call(component, getVal());
			}
		}

		if (info && info.type === 'prop' && (
			// @ts-ignore (access)
			info.ctx.meta.params.root ||
			!(info.name in (info.ctx.$options.propsData || {}))
		)) {
			return null;
		}

		if (proxy) {
			const normalizedOpts = {
				collapse: true,
				...opts,
				...watchInfo.opts,
				immediate: false
			};

			if (info.type === 'system') {
				if (!Object.getOwnPropertyDescriptor(info.ctx, info.name)?.get) {
					proxy[watcherInitializer]?.();
					mute(proxy);
					proxy[info.name] = info.ctx[info.name];
					unmute(proxy);

					Object.defineProperty(info.ctx, info.name, {
						enumerable: true,
						configurable: true,
						get: () => proxy[info.name],
						set: (v) => proxy[info.name] = v
					});
				}

			} else if (info.type === 'prop') {
				const
					destructors = <Function[]>[];

				const watchHandler = (val, oldVal, info) => {
					for (let i = destructors.length; --i > 0;) {
						destructors[i]();
						destructors.pop();
					}

					attachDeepProxy();

					if (val?.[fakeCopyLabel]) {
						return;
					}

					handler.call(this, val, oldVal, info);
				};

				let
					unwatch;

				if ('watch' in watchInfo) {
					const
						prop = info.path.split('.')[0];

					unwatch = watchInfo.watch(prop, (value, oldValue) => {
						const info = {
							obj: component,
							root: component,
							path: [prop],
							originalPath: [prop],
							top: value,
							fromProto: false
						};

						const
							tiedLinks = handler[cacheStatus];

						if (tiedLinks) {
							for (let i = 0; i < tiedLinks.length; i++) {
								const modifiedInfo = {
									...info,
									path: tiedLinks[i],
									parent: {value, oldValue, info}
								};

								watchHandler(value, oldValue, modifiedInfo);
							}

						} else {
							watchHandler(value, oldValue, info);
						}
					});

				} else {
					unwatch = watch(proxy, info.path, normalizedOpts, watchHandler).unwatch;
				}

				destructors.push(unwatch);

				const
					pathChunks = info.path.split('.');

				const attachDeepProxy = () => {
					const
						proxyVal = Object.get(unwrap(proxy), info.path);

					if (getProxyType(proxyVal)) {
						const normalizedOpts = {
							collapse: true,
							...opts,
							immediate: false,
							pathModifier: (path) => [...pathChunks, ...path.slice(1)]
						};

						const watchHandler = (...args) => {
							if (args.length === 1) {
								args = args[0][args[0].length - 1];
							}

							const
								[val, oldVal, mutInfo] = args;

							if (mutInfo.originalPath.length > 1) {
								handler.call(this, val, oldVal, mutInfo);
							}
						};

						const {unwatch} = watch(<object>proxyVal, normalizedOpts, watchHandler);
						destructors.push(unwatch);
					}
				};

				attachDeepProxy();

				return () => {
					for (let i = 0; i < destructors.length; i++) {
						destructors[i]();
					}
				};
			}

			const {unwatch} = watch(proxy, info.path, normalizedOpts, handler);
			return unwatch;
		}

		let
			handlersStore = dynamicHandlers.get(component);

		if (!handlersStore) {
			handlersStore = Object.createDict();
			dynamicHandlers.set(component, handlersStore);
		}

		const
			nm = info.accessor || info.name;

		let
			handlersSet = handlersStore[nm];

		if (!handlersSet) {
			handlersSet = handlersStore[nm] = new Set<Function>();
		}

		handlersSet.add(handler);

		return () => {
			handlersSet?.delete(handler);
		};
	};
}
