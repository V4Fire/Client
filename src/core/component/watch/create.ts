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
		if (component.isFlyweight) {
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

			// @ts-ignore
			ctxParams = info.ctx.meta.params;

		const
			isAccessor = info.type === 'accessor' || info.type === 'computed' || info.accessor,
			watchInfo = isAccessor ? null : proxyGetters[info.type]?.(info.ctx);

		let
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
				const val = oldVal;
				oldVal = undefined;
				handler.call(component, val);
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

		if (info.type === 'prop' && (
			ctxParams.root ||
			ctxParams.functional === true ||
			!(info.name in (info.ctx.$options.propsData || {})))
		) {
			return null;
		}

		if (proxy) {
			const normalizedOpts = {
				collapse: true,
				...opts,
				...watchInfo.opts
			};

			switch (info.type) {
				case 'system':
					if (!Object.getOwnPropertyDescriptor(info.ctx, info.name)?.get) {
						proxy[watcherInitializer]?.();
						proxy = watchInfo?.value;

						mute(proxy);
						proxy[info.name] = info.ctx[info.name];
						unmute(proxy);

						Object.defineProperty(info.ctx, info.name, {
							enumerable: true,
							configurable: true,
							get: () => proxy[info.name],
							set: (val) => {
								// @ts-ignore (access))
								info.ctx.$set(proxy, info.name, val);
							}
						});
					}

					break;

				case 'attr': {
					let
						unwatch;

					if ('watch' in watchInfo) {
						const
							rootName = info.name;

						unwatch = watchInfo.watch(rootName, (value, oldValue) => {
							const info = {
								obj: component,
								root: component,
								path: [rootName],
								originalPath: [rootName],
								top: value,
								fromProto: false
							};

							handler.call(this, value, oldValue, info);
						});

					} else {
						unwatch = watch(proxy, info.path, normalizedOpts, handler).unwatch;
					}

					return unwatch;
				}

				case 'prop': {
					const
						destructors = <Function[]>[];

					const watchHandler = (value, oldValue, info) => {
						for (let i = destructors.length; --i > 0;) {
							destructors[i]();
							destructors.pop();
						}

						attachDeepProxy();

						if (value?.[fakeCopyLabel]) {
							return;
						}

						handler.call(this, value, oldValue, info);
					};

					let
						unwatch;

					if ('watch' in watchInfo) {
						const
							rootName = info.name;

						unwatch = watchInfo.watch(rootName, (value, oldValue) => {
							const info = {
								obj: component,
								root: component,
								path: [rootName],
								originalPath: [rootName],
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
