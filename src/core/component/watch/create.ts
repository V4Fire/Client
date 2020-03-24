/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import watch, { unwrap, getProxyType, WatchHandlerParams } from 'core/object/watch';

import { getPropertyInfo, PropertyInfo } from 'core/component/reflection';
import { ComponentInterface, WatchOptions, RawWatchHandler } from 'core/component/interface';

import { proxyGetters } from 'core/component/engines';
import { fakeCopyLabel } from 'core/component/watch/const';
import { DynamicHandlers } from 'core/component/watch/interface';
import { cloneWatchValue } from 'core/component';

/**
 * Creates a function to watch changes from the specified component instance and returns it
 *
 * @param component - component instance
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
			watchInfo = proxyGetters[info.type]?.(info.ctx),
			proxy = watchInfo?.value;

		const
			needCache = handler.length > 1,
			ref = info.originalPath;

		let
			oldVal;

		const
			isAccessor = info.type === 'accessor' || info.type === 'computed' || info.accessor,
			getVal = () => Object.get(info.type === 'field' ? proxy : component, info.originalPath);

		if (needCache) {
			oldVal = watchCache[ref] = ref in watchCache ?
				watchCache[ref] :
				opts?.immediate || !isAccessor ? cloneWatchValue(getVal(), opts) : undefined;

			const
				original = handler;

			handler = (val, _, ...args) => {
				if (isAccessor) {
					val = Object.get(component, info.originalPath);
				}

				const res = original.call(this, val, oldVal, ...args);
				oldVal = watchCache[ref] = cloneWatchValue(val, opts);
				return res;
			};

			if (opts?.immediate) {
				handler.call(component, oldVal);
			}

		} else if (opts?.immediate) {
			handler.call(component, getVal());
		}

		if (info && info.type === 'prop' && (
			// @ts-ignore (access)
			info.ctx.meta.params.root ||
			!(info.name in (info.ctx.$options.propsData || {}))
		)) {
			return null;
		}

		const normalizedOpts = {
			collapse: true,
			...opts,
			...watchInfo.opts,
			immediate: false
		};

		if (proxy) {
			if (info.type === 'system') {
				if (!Object.getOwnPropertyDescriptor(info.ctx, info.name)?.get) {
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

					attachDeepProxy(val);

					if (val[fakeCopyLabel]) {
						return;
					}

					handler.call(this, val, oldVal, info);
				};

				const {unwatch} = watch(proxy, info.path, normalizedOpts, watchHandler);
				destructors.push(unwatch);

				const
					pathChunks = info.path.split('.');

				const attachDeepProxy = (proxy) => {
					const
						proxyVal = Object.get(unwrap(proxy), info.path);

					if (getProxyType(proxyVal)) {
						const {unwatch} = watch(<object>proxyVal, normalizedOpts, (...args) => {
							component.$nextTick(() => {
								const modInfo = (mutInfo) => {
									mutInfo = Object.create(mutInfo);
									mutInfo.path = [...pathChunks, ...mutInfo.path.slice(1)];
									return mutInfo;
								};

								if (args.length === 3) {
									const
										[val, oldVal, mutInfo] = args;

									if (mutInfo.path.length > 1) {
										handler.call(this, val, oldVal, modInfo(mutInfo));
									}

								} else {
									const
										values = <[unknown, unknown, WatchHandlerParams][]>args[0];

									for (let i = 0; i < values.length; i++) {
										const
											[val, oldVal, mutInfo] = values[i];

										if (mutInfo.path.length > 1) {
											handler.call(this, val, oldVal, modInfo(mutInfo));
										}
									}
								}
							});
						});

						destructors.push(unwatch);
					}
				};

				attachDeepProxy(proxy);

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
