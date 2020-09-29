/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import watch, { mute, unmute, unwrap, getProxyType, isProxy } from 'core/object/watch';

import { getPropertyInfo, PropertyInfo } from 'core/component/reflection';
import { proxyGetters } from 'core/component/engines';
import { ComponentInterface, WatchOptions, RawWatchHandler } from 'core/component/interface';

import { tiedWatchers, watcherInitializer, fakeCopyLabel } from 'core/component/watch/const';
import { cloneWatchValue } from 'core/component/watch/clone';
import { attachDynamicWatcher } from 'core/component/watch/helpers';

/**
 * Creates a function to watch changes from the specified component instance and returns it
 * @param component
 */
export function createWatchFn(component: ComponentInterface): ComponentInterface['$watch'] {
	const
		watchCache = new Map();

	// eslint-disable-next-line @typescript-eslint/typedef
	return function watchFn(this: unknown, path, optsOrHandler, rawHandler?) {
		if (component.isFlyweight) {
			return null;
		}

		let
			handler: RawWatchHandler,
			opts: WatchOptions;

		if (Object.isFunction(optsOrHandler)) {
			handler = optsOrHandler;
			opts = {};

		} else {
			handler = rawHandler;
			opts = optsOrHandler ?? {};
		}

		let
			info: PropertyInfo;

		if (Object.isString(path)) {
			info = getPropertyInfo(path, component);

		} else {
			info = isProxy(path) ? {ctx: path} : path;
		}

		if (!Object.isString(info.type)) {
			Object.assign(info, {
				type: 'mounted',
				originalPath: info.path,
				fullPath: info.path
			});
		}

		const
			isDefinedPath = Object.size(info.path) > 0,
			isAccessor = Boolean(info.type === 'accessor' || info.type === 'computed' || info.accessor),
			watchInfo = isAccessor ? null : proxyGetters[info.type]?.(info.ctx);

		let
			proxy = watchInfo?.value;

		const normalizedOpts = <WatchOptions>{
			collapse: true,
			...opts,
			...watchInfo?.opts
		};

		const
			needCache = handler.length > 1 && (isDefinedPath || normalizedOpts.collapse),
			originalHandler = handler;

		let
			oldVal;

		if (needCache) {
			let
				cacheKey;

			if (Object.isString(info.originalPath)) {
				cacheKey = [info.originalPath];

			} else {
				cacheKey = Array.concat([info.ctx], info.path);
			}

			if (Object.has(watchCache, cacheKey)) {
				oldVal = Object.get(watchCache, cacheKey);

			} else {
				oldVal = normalizedOpts.immediate || !isAccessor ? cloneWatchValue(getVal(), normalizedOpts) : undefined;
				Object.set(watchCache, cacheKey, oldVal);
			}

			handler = (val, _, i) => {
				if (isAccessor) {
					if (normalizedOpts.collapse) {
						val = Object.get(info.ctx, info.accessor ?? info.name);

					} else {
						val = Object.get(component, info.originalPath);
					}
				}

				if (!isDefinedPath && Object.isArray(i?.path)) {
					oldVal = Object.get(oldVal, [i.path[0]]);
				}

				const
					res = originalHandler.call(this, val, oldVal, i);

				oldVal = cloneWatchValue(isDefinedPath ? val : getVal(), normalizedOpts);
				Object.set(watchCache, cacheKey, oldVal);

				return res;
			};

			handler[tiedWatchers] = originalHandler[tiedWatchers];

			if (normalizedOpts.immediate) {
				const val = oldVal;
				oldVal = undefined;
				handler.call(component, val);
			}

		} else {
			if (isAccessor) {
				handler = (val, _, i) => {
					if (normalizedOpts.collapse) {
						val = Object.get(info.ctx, info.accessor ?? info.name);

					} else {
						val = Object.get(component, info.originalPath);
					}

					if (!isDefinedPath && Object.isArray(i?.path)) {
						oldVal = Object.get(oldVal, [i.path[0]]);
					}

					const res = originalHandler.call(this, val, oldVal, i);
					oldVal = isDefinedPath ? val : getVal();

					return res;
				};
			}

			if (normalizedOpts.immediate) {
				handler.call(component, getVal());
			}
		}

		let
			rootOrFunctional = false;

		if (info.type !== 'mounted') {
			const
				propCtx = info.ctx.unsafe,
				ctxParams = propCtx.meta.params;

			rootOrFunctional = Boolean(ctxParams.root) || ctxParams.functional === true;
		}

		if (proxy != null) {
			if (watchInfo == null) {
				return null;
			}

			switch (info.type) {
				case 'system':
					if (!Object.getOwnPropertyDescriptor(info.ctx, info.name)?.get) {
						proxy[watcherInitializer]?.();
						proxy = watchInfo.value;

						mute(proxy);
						proxy[info.name] = info.ctx[info.name];
						unmute(proxy);

						const
							propCtx = info.ctx.unsafe;

						Object.defineProperty(info.ctx, info.name, {
							enumerable: true,
							configurable: true,
							get: () => proxy[info.name],
							set: (val) => {
								propCtx.$set(proxy, info.name, val);
							}
						});
					}

					break;

				case 'attr': {
					const
						attr = info.name;

					if (rootOrFunctional) {
						return null;
					}

					let
						unwatch;

					if ('watch' in watchInfo) {
						unwatch = watchInfo.watch(attr, (value, oldValue) => {
							const info = {
								obj: component,
								root: component,
								path: [attr],
								originalPath: [attr],
								top: value,
								fromProto: false
							};

							handler.call(this, value, oldValue, info);
						});

					} else {
						// eslint-disable-next-line @typescript-eslint/unbound-method
						unwatch = watch(proxy, info.path, normalizedOpts, handler).unwatch;
					}

					return wrapDestructor(unwatch);
				}

				case 'prop': {
					const
						prop = info.name;

					if (rootOrFunctional) {
						return null;
					}

					const
						destructors = <Function[]>[];

					const watchHandler = (value, oldValue, info) => {
						for (let i = destructors.length; --i > 0;) {
							destructors[i]();
							destructors.pop();
						}

						// eslint-disable-next-line @typescript-eslint/no-use-before-define
						attachDeepProxy();

						if (value?.[fakeCopyLabel] === true) {
							return;
						}

						handler.call(this, value, oldValue, info);
					};

					let
						unwatch;

					if ('watch' in watchInfo) {
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
								tiedLinks = handler[tiedWatchers];

							if (Object.isArray(tiedLinks)) {
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
						// eslint-disable-next-line @typescript-eslint/unbound-method
						unwatch = watch(proxy, info.path, <any>normalizedOpts, watchHandler).unwatch;
					}

					destructors.push(unwatch);

					const
						pathChunks = info.path.split('.');

					const attachDeepProxy = () => {
						const
							proxyVal = Object.get(unwrap(proxy), info.path);

						if (getProxyType(proxyVal) != null) {
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

							// eslint-disable-next-line @typescript-eslint/unbound-method
							const {unwatch} = watch(<object>proxyVal, normalizedOpts, watchHandler);
							destructors.push(unwatch);
						}
					};

					attachDeepProxy();

					return wrapDestructor(() => {
						for (let i = 0; i < destructors.length; i++) {
							destructors[i]();
						}
					});
				}

				default:
					// Loopback
			}

			// eslint-disable-next-line @typescript-eslint/unbound-method
			const {unwatch} = isDefinedPath ?
				watch(proxy, info.path, normalizedOpts, handler) :
				watch(proxy, normalizedOpts, handler);

			return wrapDestructor(unwatch);
		}

		return attachDynamicWatcher(component, info, opts, handler);

		function getVal(): unknown {
			let
				ctx,
				path;

			switch (info.type) {
				case 'mounted':
					ctx = info.ctx;

					if (isDefinedPath) {
						path = info.path;
					}

					break;

				case 'field':
					ctx = proxy;
					path = info.originalPath;
					break;

				default:
					ctx = component;
					path = info.originalPath;
			}

			if (path == null) {
				return ctx;
			}

			if (normalizedOpts.collapse) {
				const normalizedPath = Object.isString(path) ? path.split('.') : path;
				return Object.get(ctx, normalizedPath.slice(0, info.type === 'mounted' ? 1 : 2));
			}

			return Object.get(ctx, path);
		}

		function wrapDestructor<T>(destructor: T): T {
			if (Object.isFunction(destructor)) {
				// Every worker that passed to async have a counter with number of consumers of this worker,
				// but in this case this behaviour is redundant and can produce an error,
				// that why we wrap original destructor with a new function
				component.unsafe.$async.worker(() => destructor());
			}

			return destructor;
		}
	};
}
