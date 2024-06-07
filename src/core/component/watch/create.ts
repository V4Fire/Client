/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import watch, { mute, unmute, unwrap, getProxyType, isProxy, WatchHandlerParams } from 'core/object/watch';

import { tiedWatchers, watcherInitializer } from 'core/component/watch/const';
import { cloneWatchValue } from 'core/component/watch/clone';
import { attachDynamicWatcher } from 'core/component/watch/helpers';

import { getPropertyInfo, PropertyInfo } from 'core/component/reflect';

import type { ComponentMeta } from 'core/component/meta';
import type { ComponentInterface, WatchOptions, RawWatchHandler } from 'core/component/interface';

/**
 * Creates a function to watch property changes from the specified component instance and returns it
 * @param component
 */
// eslint-disable-next-line max-lines-per-function
export function createWatchFn(component: ComponentInterface): ComponentInterface['$watch'] {
	const
		watchCache = new Map();

	// eslint-disable-next-line @typescript-eslint/typedef,max-lines-per-function,complexity
	return function watchFn(this: ComponentInterface, path, optsOrHandler, rawHandler?) {
		let
			info: PropertyInfo,
			opts: WatchOptions,
			handler: RawWatchHandler;

		if (Object.isFunction(optsOrHandler)) {
			handler = optsOrHandler;
			opts = {};

		} else {
			handler = rawHandler;
			opts = optsOrHandler ?? {};
		}

		const
			originalHandler = handler;

		if (Object.isString(path)) {
			info = getPropertyInfo(path, component);

		} else {
			if (isProxy(path)) {
				info = Object.cast({ctx: path});

			} else {
				info = path;
			}

			if (isProxy(info.ctx)) {
				info.type = 'mounted';
				info.originalPath = info.path;
				info.fullPath = info.path;
			}
		}

		const
			isDefinedPath = Object.size(info.path) > 0;

		let
			isRoot = false,
			isFunctional = false,
			meta: CanUndef<ComponentMeta> = undefined;

		if (info.type !== 'mounted') {
			const
				propCtx = info.ctx.unsafe,
				ctxParams = propCtx.meta.params;

			meta = propCtx.meta;
			isRoot = Boolean(ctxParams.root);
			isFunctional = !isRoot && ctxParams.functional === true;
		}

		let canSkipWatching =
			(isRoot || isFunctional) &&
			(info.type === 'prop' || info.type === 'attr');

		if (!canSkipWatching && isFunctional) {
			let
				f;

			switch (info.type) {
				case 'system':
					f = meta?.systemFields[info.name];
					break;

				case 'field':
					f = meta?.fields[info.name];
					break;

				default:
					// Do nothing
			}

			if (f != null) {
				canSkipWatching = f.functional === false || f.functionalWatching === false;
			}
		}

		const
			isAccessor = Boolean(info.type === 'accessor' || info.type === 'computed' || info.accessor),
			isMountedWatcher = info.type === 'mounted';

		const watchInfo = !isAccessor ?
			component.$renderEngine.proxyGetters[info.type]?.(info.ctx) :
			null;

		const normalizedOpts: WatchOptions = {
			collapse: true,
			...opts,
			...watchInfo?.opts
		};

		const
			needCollapse = normalizedOpts.collapse,
			needImmediate = normalizedOpts.immediate,
			needCache = (handler['originalLength'] ?? handler.length) > 1 && needCollapse;

		if (canSkipWatching && !needImmediate) {
			return null;
		}

		const
			{flush} = normalizedOpts;

		delete normalizedOpts.flush;
		normalizedOpts.immediate = flush === 'sync';

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
				oldVal = needImmediate || !isAccessor ? cloneWatchValue(getVal(), normalizedOpts) : undefined;
				Object.set(watchCache, cacheKey, oldVal);
			}

			handler = (val, _, i) => {
				const h = () => {
					if (!isDefinedPath && Object.isArray(val) && val.length > 0) {
						i = (<[unknown, unknown, PropertyInfo]>val[val.length - 1])[2];
					}

					if (isMountedWatcher) {
						val = info.ctx;
						patchPath(i);

					} else if (isAccessor) {
						val = Object.get(info.ctx, info.accessor ?? info.name);
					}

					const
						res = originalHandler.call(this, val, oldVal, i);

					oldVal = cloneWatchValue(isDefinedPath ? val : getVal(), normalizedOpts);
					Object.set(watchCache, cacheKey, oldVal);

					return res;
				};

				if (flush === 'post') {
					return component.$nextTick().then(h);
				}

				return h();
			};

			handler[tiedWatchers] = originalHandler[tiedWatchers];

			if (needImmediate) {
				const val = oldVal;
				oldVal = undefined;
				handler.call(component, val, undefined, undefined);
			}

		} else {
			if (isMountedWatcher) {
				handler = (val, ...args) => {
					const h = () => {
						let
							oldVal = args[0],
							handlerParams = args[1];

						if (!isDefinedPath && needCollapse && Object.isArray(val) && val.length > 0) {
							handlerParams = (<[unknown, unknown, PropertyInfo]>val[val.length - 1])[2];

						} else if (args.length === 0) {
							return originalHandler.call(this, val.map(([val, oldVal, i]) => {
								patchPath(i);
								return [val, oldVal, i];
							}));
						}

						if (needCollapse) {
							val = info.ctx;
							oldVal = val;
						}

						patchPath(handlerParams);
						return originalHandler.call(this, val, oldVal, handlerParams);
					};

					if (flush === 'post') {
						return component.$nextTick().then(h);
					}

					return h();
				};

			} else if (isAccessor) {
				handler = (val, _, i) => {
					const h = () => {
						if (needCollapse) {
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

					if (flush === 'post') {
						return component.$nextTick().then(h);
					}

					return h();
				};
			}

			if (needImmediate) {
				handler.call(component, getVal(), undefined, undefined);
			}
		}

		if (canSkipWatching) {
			return null;
		}

		let
			proxy = watchInfo?.value;

		if (proxy != null) {
			if (watchInfo == null) {
				return null;
			}

			switch (info.type) {
				case 'field':
				case 'system': {
					const
						propCtx = info.ctx.unsafe;

					if (!Object.getOwnPropertyDescriptor(propCtx, info.name)?.get) {
						proxy[watcherInitializer]?.();
						proxy = watchInfo.value;

						mute(proxy);

						if (info.type === 'system') {
							propCtx.$set(proxy, info.name, propCtx[info.name]);
						}

						unmute(proxy);

						const needCreateAccessors =
							isFunctional ||
							info.type === 'system' ||
							!(info.name in propCtx);

						if (needCreateAccessors) {
							Object.defineProperty(propCtx, info.name, {
								configurable: true,
								enumerable: true,

								get: () =>
									proxy[info.name],

								set: (val) => {
									propCtx.$set(proxy, info.name, val);
								}
							});
						}
					}

					break;
				}

				case 'attr': {
					const
						attr = info.name;

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
						// eslint-disable-next-line @v4fire/unbound-method
						unwatch = watch(proxy, info.path, normalizedOpts, handler).unwatch;
					}

					return wrapDestructor(unwatch);
				}

				case 'prop': {
					const
						prop = info.name,
						pathChunks = info.path.split('.'),
						slicedPathChunks = pathChunks.slice(1);

					const
						destructors: Function[] = [];

					const watchHandler = (value, oldValue, info) => {
						for (let i = destructors.length; --i > 0;) {
							destructors[i]();
							destructors.pop();
						}

						// eslint-disable-next-line @typescript-eslint/no-use-before-define
						attachDeepProxy();

						let valueByPath = Object.get(value, slicedPathChunks);
						valueByPath = unwrap(valueByPath) ?? valueByPath;

						let oldValueByPath = Object.get(oldValue, slicedPathChunks);
						oldValueByPath = unwrap(oldValueByPath) ?? oldValueByPath;

						if (valueByPath !== oldValueByPath) {
							if (needCollapse) {
								handler.call(this, value, oldValue, info);

							} else {
								handler.call(this, valueByPath, oldValueByPath, info);
							}
						}
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
								tiedLinks.forEach((path) => {
									const modifiedInfo = {
										...info,
										path,
										parent: {value, oldValue, info}
									};

									watchHandler(value, oldValue, modifiedInfo);
								});

							} else {
								watchHandler(value, oldValue, info);
							}
						});

					} else {
						const topOpts = {
							...normalizedOpts,
							deep: false,
							collapse: true
						};

						// eslint-disable-next-line @v4fire/unbound-method
						unwatch = watch(proxy, prop, topOpts, Object.cast(watchHandler)).unwatch;
					}

					destructors.push(unwatch);

					const attachDeepProxy = () => {
						const
							propVal = proxy[prop];

						if (getProxyType(propVal) != null) {
							const
								parent = component.$parent;

							if (parent == null) {
								return;
							}

							const normalizedOpts = {
								collapse: true,
								...opts,
								pathModifier: (path) => {
									if (parent[path[0]] === propVal) {
										return [pathChunks[0], ...path.slice(1)];
									}

									return path;
								}
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

							// eslint-disable-next-line @v4fire/unbound-method
							const {unwatch} = watch(<object>propVal, info.path, normalizedOpts, watchHandler);
							destructors.push(unwatch);
						}
					};

					attachDeepProxy();
					return wrapDestructor(() => destructors.forEach((destroy) => destroy()));
				}

				default:
					// Loopback
			}

			// eslint-disable-next-line @v4fire/unbound-method
			const {unwatch} = isDefinedPath ?
				watch(proxy, info.path, normalizedOpts, handler) :
				watch(proxy, normalizedOpts, handler);

			return wrapDestructor(unwatch);
		}

		return attachDynamicWatcher(component, info, opts, handler);

		function patchPath(params?: WatchHandlerParams) {
			// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
			if (params == null || info.name == null) {
				return;
			}

			if (needCollapse) {
				params.path = [info.name];
				params.originalPath = params.path;

			} else {
				params.path.unshift(info.name);

				if (params.path !== params.originalPath) {
					params.originalPath.unshift(info.name);
				}
			}
		}

		function getVal(): unknown {
			if (info.type !== 'mounted') {
				return Object.get(component, needCollapse ? info.originalTopPath : info.originalPath);
			}

			if (!isDefinedPath || needCollapse) {
				return info.ctx;
			}

			return Object.get(component, info.path);
		}

		function wrapDestructor<T>(destructor: T): T {
			if (Object.isFunction(destructor)) {
				// Every worker passed to Async has a counter with a number of consumers of this worker,
				// but in this case this behaviour is redundant and can produce an error,
				// that's why we wrap original destructor with a new function
				component.unsafe.$async.worker(() => {
					watchCache.clear();
					return destructor();
				});
			}

			return destructor;
		}
	};
}
