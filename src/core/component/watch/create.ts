/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import watch, { mute, unmute, unwrap, getProxyType } from 'core/object/watch';

import { getPropertyInfo, PropertyInfo } from 'core/component/reflection';
import { proxyGetters } from 'core/component/engines';
import { ComponentInterface,  WatchOptions, RawWatchHandler } from 'core/component/interface';

import { tiedWatchers, watcherInitializer, fakeCopyLabel } from 'core/component/watch/const';
import { cloneWatchValue } from 'core/component/watch/clone';
import { attachDynamicWatcher } from 'core/component/watch/helpers';

/**
 * Creates a function to watch changes from the specified component instance and returns it
 * @param component
 */
export function createWatchFn(component: ComponentInterface): ComponentInterface['$watch'] {
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
			propCtx = info.ctx.unsafe,
			ctxParams = propCtx.meta.params;

		const
			isAccessor = info.type === 'accessor' || info.type === 'computed' || info.accessor,
			watchInfo = isAccessor ? null : proxyGetters[info.type]?.(info.ctx);

		let
			proxy = watchInfo?.value;

		const
			needCache = handler.length > 1,
			ref = info.originalPath;

		const normalizedOpts = {
			collapse: true,
			...opts,
			...watchInfo?.opts
		};

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
					// tslint:disable-next-line:prefer-conditional-expression
					if (normalizedOpts.collapse) {
						val = Object.get(info.ctx, info.accessor ?? info.name);

					} else {
						val = Object.get(component, info.originalPath);
					}
				}

				const res = originalHandler.call(this, val, oldVal, ...args);
				oldVal = watchCache[ref] = cloneWatchValue(val, opts);
				return res;
			};

			handler[tiedWatchers] = originalHandler[tiedWatchers];

			if (opts?.immediate) {
				const val = oldVal;
				oldVal = undefined;
				handler.call(component, val);
			}

		} else {
			if (isAccessor) {
				handler = (val, oldVal, ...args) => {
					// tslint:disable-next-line:prefer-conditional-expression
					if (normalizedOpts.collapse) {
						val = Object.get(info.ctx, info.accessor ?? info.name);

					} else {
						val = Object.get(component, info.originalPath);
					}

					return originalHandler.call(this, val, oldVal, ...args);
				};
			}

			if (opts?.immediate) {
				handler.call(component, getVal());
			}
		}

		const rootOrFunctional = Boolean(
			ctxParams.root || ctxParams.functional === true
		);

		if (proxy) {
			if (!watchInfo) {
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
						unwatch = watch(proxy, info.path, normalizedOpts, handler).unwatch;
					}

					return unwatch;
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

						attachDeepProxy();

						if (value?.[fakeCopyLabel]) {
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

		return attachDynamicWatcher(component, info, handler);
	};
}
