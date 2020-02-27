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
 * Watches for changes of the specified object by using Proxy objects
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
 * Watches for changes of the specified object by using Proxy objects
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
	// tslint:disable-next-line:no-string-literal
	obj = obj && typeof obj === 'object' && obj['__PROXY_TARGET__'] || obj;

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

	const
		proxy = obj[watchLabel];

	if (proxy) {
		return returnProxy(obj, proxy);
	}

	if (!proxyType(obj)) {
		return returnProxy(obj);
	}

	const
		isRoot = path === undefined;

	if (!Object.isDictionary(obj) && !Object.isArray(obj)) {
		bindMutationHooks(<any>obj, {top, path, isRoot}, handlers!);
	}

	return returnProxy(obj, obj[watchLabel] = new Proxy(<any>obj, {
		get: (target, key, receiver) => {
			if (key === '__PROXY_TARGET__') {
				return target;
			}

			const
				val = Reflect.get(target, key, receiver);

			if (opts?.deep && proxyType(val)) {
				const fullPath = (<unknown[]>[]).concat(path ?? [], key);
				return watch(val, fullPath, null, opts, top || val, handlers);
			}

			if (Object.isPlainObject(target) || Object.isArray(target)) {
				return val;
			}

			return Object.isFunction(val) ? val.bind(target) : val;
		},

		set: (target, key, val, receiver) => {
			if (Object.isArray(target) && String(Number(key)) === key) {
				key = Number(key);
			}

			const
				oldVal = Reflect.get(target, key, receiver);

			if (oldVal !== val && Reflect.set(target, key, val, receiver)) {
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

			return true;
		}
	}));
}

/**
 * Sets a new watchable value for an object by the specified path
 *
 * @param obj
 * @param path
 * @param value
 */
export function set(obj: object, path: WatchPath, value: unknown): void {
	// tslint:disable-next-line:no-string-literal
	obj = obj && typeof obj === 'object' && obj['__PROXY_TARGET__'] || obj;

	const
		normalizedPath = Object.isArray(path) ? path : path.split('.');

	const
		prop = normalizedPath[normalizedPath.length - 1],
		refPath = normalizedPath.slice(0, -1);

	const
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

	ref[String(prop)] = value;
}

/**
 * Unsets a watchable value for an object by the specified path
 *
 * @param obj
 * @param path
 */
export function unset(obj: object, path: WatchPath): void {
	// tslint:disable-next-line:no-string-literal
	obj = obj && typeof obj === 'object' && obj['__PROXY_TARGET__'] || obj;

	const
		normalizedPath = Object.isArray(path) ? path : path.split('.');

	const
		prop = normalizedPath[normalizedPath.length - 1],
		refPath = normalizedPath.slice(0, -1);

	const
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

	ref[String(prop)] = undefined;
}
