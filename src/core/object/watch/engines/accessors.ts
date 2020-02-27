/*!
 * V4Fire Core
 * https://github.com/V4Fire/Core
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Core/blob/master/LICENSE
 */

import { watchLabel, watchHandlersLabel } from 'core/object/watch/const';
import { bindMutationHooks } from 'core/object/watch/wrap';
import { proxyType } from 'core/object/watch/engines/helpers';
import { WatchPath, WatchHandler, WatchOptions, Watcher } from 'core/object/watch/interface';

/**
 * Watches for changes of the specified object by using accessors
 *
 * @param obj
 * @param path - base path to object properties: it is provided to a watch handler with parameters
 * @param cb - callback that is invoked on every mutation hook
 * @param [opts] - additional options
 */
export function watch<T>(
	obj: T,
	path: CanUndef<unknown[]>,
	cb: WatchHandler,
	opts?: WatchOptions
): Watcher<T>;

/**
 * Watches for changes of the specified object by using accessors
 *
 * @param obj
 * @param path - base path to object properties: it is provided to a watch handler with parameters
 * @param cb - callback that is invoked on every mutation hook
 * @param [opts] - additional options
 * @param [top] - link a top property of watching
 * @param [handlers] - map of registered handlers
 */
export function watch<T>(
	obj: T,
	path: CanUndef<unknown[]>,
	cb: Nullable<WatchHandler>,
	opts: CanUndef<WatchOptions>,
	top: object,
	handlers: Map<WatchHandler, boolean>
): T;

export function watch<T>(
	obj: T,
	path: CanUndef<unknown[]>,
	cb: Nullable<WatchHandler>,
	opts?: WatchOptions,
	top?: object,
	handlers: Map<WatchHandler, boolean> = !top && obj[watchHandlersLabel] || new Map()
): Watcher<T> | T {
	if (!top) {
		handlers = obj[watchHandlersLabel] = handlers;
	}

	const returnProxy = (obj, proxy?) => {
		if (cb && proxy && (!top || !handlers.has(cb))) {
			handlers.set(cb, true);
		}

		if (!top) {
			return {
				proxy: proxy || obj,
				unwatch(): void {
					cb && handlers.set(cb, false);
				}
			};
		}

		return proxy || obj;
	};

	if (!obj || typeof obj !== 'object' || Object.isFrozen(obj)) {
		return returnProxy(obj);
	}

	let
		proxy = obj[watchLabel];

	if (proxy) {
		return returnProxy(obj, proxy);
	}

	if (!proxyType(obj)) {
		return returnProxy(obj);
	}

	if (!Object.isDictionary(obj)) {
		bindMutationHooks(<any>obj, {top, path, isRoot: path === undefined}, handlers!);
		return returnProxy(obj, obj);
	}

	for (let keys = Object.keys(obj), i = 0; i < keys.length; i++) {
		proxy = setWatchAccessors(obj, keys[i], path, handlers, top, opts);
	}

	return returnProxy(obj, proxy);
}

/**
 * Sets a new watchable value for an object by the specified path
 *
 * @param obj
 * @param path
 * @param value
 */
export function set(obj: object, path: WatchPath, value: unknown): void {
	const
		normalizedPath = Object.isArray(path) ? path : path.split('.');

	const
		prop = normalizedPath[normalizedPath.length - 1],
		refPath = normalizedPath.slice(0, -1);

	const
		handlers = obj[watchHandlersLabel],
		ref = Object.get(obj[watchLabel] || obj, refPath);

	if (!Object.isDictionary(ref)) {
		const
			type = proxyType(ref);

		switch (type) {
			case 'array':
				(<unknown[]>ref).splice(Number(prop), 1, value);
				break;

			case 'map':
				(<Map<unknown, unknown>>ref).set(prop, value);
		}

		return;
	}

	const
		key = String(prop),
		top = refPath.length ? ref : undefined;

	if (!handlers) {
		obj[key] = value;
		return;
	}

	setWatchAccessors(ref, key, top && refPath, handlers, top, {deep: true})[key] = value;
}

/**
 * Unsets a watchable value for an object by the specified path
 *
 * @param obj
 * @param path
 */
export function unset(obj: object, path: WatchPath): void {
	const
		normalizedPath = Object.isArray(path) ? path : path.split('.');

	const
		prop = normalizedPath[normalizedPath.length - 1],
		refPath = normalizedPath.slice(0, -1);

	const
		handlers = obj[watchHandlersLabel],
		ref = Object.get(obj[watchLabel] || obj, refPath);

	if (!Object.isDictionary(ref)) {
		const
			type = proxyType(ref);

		switch (type) {
			case 'array':
				(<unknown[]>ref).splice(Number(prop), 1);
				break;

			case 'map':
			case 'set':
				(<Map<unknown, unknown>>ref).delete(prop);
		}

		return;
	}

	const
		key = String(prop),
		top = refPath.length ? ref : undefined;

	if (!handlers) {
		delete obj[key];
		return;
	}

	const proxy = setWatchAccessors(ref, key, top && refPath, handlers, top, {deep: true});
	proxy[key] = undefined;
}

/**
 * Sets a pair of accessors to watch the specified property and returns a proxy object
 *
 * @param obj - object to watch
 * @param key - property key to watch
 * @param path - path to the object to watch from the root object
 * @param handlers - map of registered handlers
 * @param top - link a top property of watching
 * @param [opts] - additional watch options
 */
export function setWatchAccessors(
	obj: Dictionary,
	key: string,
	path: CanUndef<unknown[]>,
	handlers: Map<WatchHandler, boolean>,
	top?: object,
	opts?: WatchOptions
): Dictionary {
	const
		// @ts-ignore (symbol)
		proxy = obj[watchLabel] = obj[watchLabel] || Object.create(obj);

	const
		isRoot = path === undefined,
		descriptors = Object.getOwnPropertyDescriptor(obj, key);

	if (!descriptors || descriptors.configurable) {
		Object.defineProperty(proxy, key, {
			enumerable: true,
			configurable: true,

			get(): unknown {
				const
					val = obj[key];

				if (opts?.deep && proxyType(val)) {
					const fullPath = (<unknown[]>[]).concat(path ?? [], key);
					return watch(val, fullPath, null, opts, <any>top || val, handlers);
				}

				return val;
			},

			set(val: unknown): void {
				const
					oldVal = obj[key];

				if (oldVal !== val) {
					try {
						obj[key] = val;

					} catch {
						return;
					}

					for (let o = handlers.entries(), el = o.next(); !el.done; el = o.next()) {
						const
							[handler, state] = el.value;

						if (state) {
							handler(val, oldVal, {
								obj: <any>obj,
								top,
								isRoot,
								path: (<unknown[]>[]).concat(path ?? [], key)
							});
						}
					}
				}
			}
		});
	}

	return proxy;
}
