/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/* eslint-disable max-lines-per-function, complexity */

import watch, { mute, unmute, unwrap, getProxyType, isProxy, WatchHandlerParams } from 'core/object/watch';
import { getPropertyInfo, privateFieldRgxp, PropertyInfo } from 'core/component/reflect';

import { tiedWatchers, watcherInitializer } from 'core/component/watch/const';
import { cloneWatchValue } from 'core/component/watch/clone';
import { attachDynamicWatcher } from 'core/component/watch/helpers';

import type { ComponentMeta, ComponentField } from 'core/component/meta';
import type { ComponentInterface, WatchPath, WatchOptions, RawWatchHandler } from 'core/component/interface';

/**
 * Creates a function to watch property changes from the specified component instance and returns it
 * @param component
 */
export function createWatchFn(component: ComponentInterface): ComponentInterface['$watch'] {
	const
		watchCache = new Map();

	return function watchFn(
		this: ComponentInterface,
		path: WatchPath | object,
		optsOrHandler: WatchOptions | RawWatchHandler,
		rawHandler?: RawWatchHandler
	) {
		let
			info: PropertyInfo,
			opts: WatchOptions,
			handler: RawWatchHandler;

		if (Object.isFunction(optsOrHandler)) {
			handler = optsOrHandler;
			opts = {};

		} else {
			if (!Object.isFunction(rawHandler)) {
				throw new ReferenceError('The handler function is not specified');
			}

			handler = rawHandler;
			opts = optsOrHandler;
		}

		const originalHandler = handler;

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

		const isDefinedPath = Object.size(info.path) > 0;

		let canSkipWatching =
			(isRoot || isFunctional) &&
			(info.type === 'prop' || info.type === 'attr');

		if (!canSkipWatching && isFunctional) {
			let field: Nullable<ComponentField>;

			switch (info.type) {
				case 'system':
					field = meta?.systemFields[info.name];
					break;

				case 'field':
					field = meta?.fields[info.name];
					break;

				default:
					// Do nothing
			}

			if (field != null) {
				canSkipWatching = field.functional === false || field.functionalWatching === false;
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
			needCollapse = Boolean(normalizedOpts.collapse),
			needImmediate = Boolean(normalizedOpts.immediate),
			needCache = (handler['originalLength'] ?? handler.length) > 1 && needCollapse;

		if (canSkipWatching && !needImmediate) {
			return null;
		}

		const {flush} = normalizedOpts;
		delete normalizedOpts.flush;
		normalizedOpts.immediate = flush === 'sync';

		let oldVal: unknown;

		if (needCache) {
			let cacheKey: unknown[];

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

			handler = (value: unknown, _: unknown, i?: WatchHandlerParams) => {
				const that = this;

				if (flush === 'post') {
					return component.$nextTick().then(exec);
				}

				return exec();

				function exec() {
					if (!isDefinedPath && Object.isArray(value) && value.length > 0) {
						i = (<[any, any, WatchHandlerParams]>value[value.length - 1])[2];
					}

					if (isMountedWatcher) {
						value = info.ctx;
						patchPath(i);

					} else if (isAccessor) {
						value = Object.get(info.ctx, info.accessor ?? info.name);
					}

					const res = originalHandler.call(that, value, oldVal, i);

					oldVal = cloneWatchValue(isDefinedPath ? value : getVal(), normalizedOpts);
					Object.set(watchCache, cacheKey, oldVal);

					return res;
				}
			};

			handler[tiedWatchers] = originalHandler[tiedWatchers];

			if (needImmediate) {
				const val = oldVal;
				oldVal = undefined;
				handler.call(component, val, undefined, undefined);
			}

		} else {
			if (isMountedWatcher) {
				handler = (value: unknown, ...args: [unknown?, WatchHandlerParams?]) => {
					const that = this;

					if (flush === 'post') {
						return component.$nextTick().then(exec);
					}

					return exec();

					function exec() {
						let
							oldVal = args[0],
							handlerParams = args[1];

						if (!isDefinedPath && needCollapse && Object.isArray(value) && value.length > 0) {
							handlerParams = (<[any, any, WatchHandlerParams]>value[value.length - 1])[2];

						} else if (args.length === 0 && Object.isArray(value)) {
							const args = Object.cast<Array<[unknown, unknown, WatchHandlerParams]>>(value).map(([v, o, i]) => {
								patchPath(i);
								return [v, o, i];
							});

							return originalHandler.call(that, args);
						}

						if (needCollapse) {
							value = info.ctx;
							oldVal = value;
						}

						patchPath(handlerParams);
						return originalHandler.call(that, value, oldVal, handlerParams);
					}
				};

			} else if (isAccessor) {
				handler = (value: unknown, _: unknown, i?: WatchHandlerParams) => {
					const that = this;

					if (flush === 'post') {
						return component.$nextTick().then(exec);
					}

					return exec();

					function exec() {
						if (needCollapse) {
							value = Object.get(info.ctx, info.accessor ?? info.name);

						} else {
							value = Object.get(component, info.originalPath);
						}

						const path = i?.path;

						if (!isDefinedPath && Object.isArray(path)) {
							oldVal = Object.get(oldVal, [path[0]]);
						}

						const res = originalHandler.call(that, value, oldVal, i);
						oldVal = isDefinedPath ? value : getVal();

						return res;
					}
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
						unwatch: Function;

					if ('watch' in watchInfo) {
						unwatch = watchInfo.watch(attr, (value: object, oldValue: object) => {
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
						forceUpdate = meta?.props[info.name]?.forceUpdate !== false,
						destructors: Function[] = [];

					const attachDeepProxy = (forceUpdate = true) => {
						const getAccessors: CanUndef<ReturnType<ComponentInterface['createPropAccessors']>> = Object.cast(
							this.$attrs[`on:${prop}`]
						);

						let accessors: Nullable<ReturnType<NonNullable<typeof getAccessors>>>;

						if (!forceUpdate) {
							accessors = getAccessors?.();
						}

						const
							parent = component.$parent,
							propVal = forceUpdate ? proxy[prop] : accessors?.[0];

						if (parent == null || getProxyType(propVal) == null) {
							return;
						}

						const normalizedOpts = {
							collapse: true,

							...opts,

							pathModifier: (path: unknown[]) => {
								const
									valueFromParent = Object.unwrapProxy(parent[<any>path[0]]),
									valueFromHandler = Object.unwrapProxy(propVal);

								// Since the root property of the path for this prop will differ in the context of the parent component,
								// we explicitly fix it
								if (valueFromParent === valueFromHandler) {
									return [pathChunks[0], ...path.slice(1)];
								}

								return path;
							}
						};

						type WatchHandlerArgs = [unknown, unknown, WatchHandlerParams];

						const watchHandler = (...args: [WatchHandlerArgs[]] | WatchHandlerArgs) => {
							if (args.length === 1) {
								args = args[0][args[0].length - 1];
							}

							const [value, oldValue, info] = args;

							if (info.originalPath.length <= 1) {
								return;
							}

							const tiedLinks = handler[tiedWatchers];

							if (Object.isArray(tiedLinks)) {
								tiedLinks.forEach((path) => {
									if (!Object.isArray(path)) {
										return;
									}

									const modifiedInfo: WatchHandlerParams = {
										...info,
										path,
										parent: {value, oldValue, info}
									};

									handler.call(this, value, oldValue, modifiedInfo);
								});

							} else {
								handler.call(this, value, oldValue, info);
							}
						};

						const watcher = forceUpdate ?
							watch(<object>propVal, info.path, normalizedOpts, watchHandler) :
							accessors?.[1](info.path, normalizedOpts, watchHandler);

						if (watcher != null) {
							destructors.push(watcher.unwatch.bind(watcher));
						}
					};

					const externalWatchHandler = (value: unknown, oldValue: unknown, i?: WatchHandlerParams) => {
						const fromSystem = i != null && Object.isString(i.path[0]) && i.path[0].startsWith('[[');

						destructors.forEach((destroy) => destroy());
						destructors.splice(1, destructors.length);

						if (fromSystem) {
							i.path = [String(i.path[0]).replace(privateFieldRgxp, '$1'), ...i.path.slice(1)];
							attachDeepProxy(false);

						} else {
							attachDeepProxy();
						}

						let valueByPath = Object.get(value, slicedPathChunks);
						valueByPath = unwrap(valueByPath) ?? valueByPath;

						let oldValueByPath = Object.get(oldValue, slicedPathChunks);
						oldValueByPath = unwrap(oldValueByPath) ?? oldValueByPath;

						if (valueByPath !== oldValueByPath) {
							if (needCollapse) {
								handler.call(this, value, oldValue, i);

							} else {
								handler.call(this, valueByPath, oldValueByPath, i);
							}
						}
					};

					let unwatch: Function;

					if (forceUpdate && 'watch' in watchInfo) {
						unwatch = watchInfo.watch(prop, (value: object, oldValue?: object) => {
							const info: WatchHandlerParams = {
								obj: component,
								root: component,
								path: [prop],
								originalPath: [prop],
								top: value,
								fromProto: false
							};

							const tiedLinks = handler[tiedWatchers];

							if (Object.isArray(tiedLinks)) {
								tiedLinks.forEach((path) => {
									if (!Object.isArray(path)) {
										return;
									}

									const modifiedInfo: WatchHandlerParams = {
										...info,
										path,
										parent: {value, oldValue, info}
									};

									externalWatchHandler(value, oldValue, modifiedInfo);
								});

							} else {
								externalWatchHandler(value, oldValue, info);
							}
						});

					} else {
						const topOpts = {
							...normalizedOpts,
							deep: false,
							collapse: true
						};

						if (forceUpdate) {
							// eslint-disable-next-line @v4fire/unbound-method
							unwatch = watch(proxy, prop, topOpts, Object.cast(externalWatchHandler)).unwatch;

						} else {
							unwatch = watchFn.call(this, `[[${prop}]]`, topOpts, externalWatchHandler);
						}
					}

					destructors.push(unwatch);
					attachDeepProxy(forceUpdate);

					return wrapDestructor(() => {
						destructors.forEach((destroy) => destroy());
						destructors.splice(0, destructors.length);
					});
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
				// Every worker passed to Async has a counter that tracks the number of consumers of this worker.
				// However, in this case, this behavior is redundant and could lead to an error.
				// That's why we wrap the original destructor with a new function.
				component.unsafe.$async.worker(() => {
					watchCache.clear();
					return destructor();
				});
			}

			return destructor;
		}
	};
}
