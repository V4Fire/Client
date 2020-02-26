/*!
 * V4Fire Core
 * https://github.com/V4Fire/Core
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Core/blob/master/LICENSE
 */

import { bindMutationHooks } from 'core/object/watch/wrap';
import { WatchHandler, WatchOptions, Watcher } from 'core/object/watch/interface';

const
	watchHandlers = Symbol('Watch handlers'),
	watchLabel = Symbol('Watch label');

/**
 * Watches for changes of the specified object by using Proxy objects
 *
 * @param obj
 * @param path - base path to object properties: it is provided to a watch handler with parameters
 * @param cb - callback that is invoked on every mutation hook
 * @param [opts] - additional options
 */
export default function watch<T>(
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
 * @param [destructors] - list of destructors to cancel of watching
 */
export default function watch<T>(
	obj: T,
	path: CanUndef<unknown[]>,
	cb: WatchHandler,
	opts: CanUndef<WatchOptions>,
	top: object,
	handlers: Map<WatchHandler, boolean>,
	destructors: Function[]
): T;

export default function watch<T>(
	obj: T,
	path: CanUndef<unknown[]>,
	cb: WatchHandler,
	opts?: WatchOptions,
	top?: object,
	handlers: Map<WatchHandler, boolean> = !top && obj[watchHandlers] || new Map(),
	destructors: Function[] = []
): Watcher<T> | T {
	// tslint:disable-next-line:no-string-literal
	obj = obj && typeof obj === 'object' && obj['__PROXY_TARGET__'] || obj;

	if (!top) {
		handlers = obj[watchHandlers] = handlers;
	}

	const returnProxy = (obj, proxy?) => {
		if (proxy) {
			if (!top || !handlers.has(cb)) {
				handlers.set(cb, true);
			}

			destructors.push(() => {
				handlers.set(cb, false);
			});
		}

		if (!top) {
			return {
				proxy: proxy || obj,
				unwatch(): void {
					destructors.forEach((fn) => fn());
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

	const canProxy = (obj) =>
		Object.isPlainObject(obj) ||
		Object.isArray(obj) ||
		Object.isMap(obj) ||
		Object.isSet(obj) ||
		Object.isWeakMap(obj) ||
		Object.isWeakSet(obj);

	if (!canProxy(obj)) {
		return returnProxy(obj);
	}

	const
		isRoot = !path;

	if (!Object.isPlainObject(obj) && !Object.isArray(obj)) {
		bindMutationHooks(<any>obj, {path, isRoot: Boolean(path)}, handlers!);
	}

	return returnProxy(obj, obj[watchLabel] = new Proxy(<any>obj, {
		get: (target, key, receiver) => {
			if (key === '__PROXY_TARGET__') {
				return target;
			}

			const
				val = Reflect.get(target, key, receiver);

			if (opts?.deep && canProxy(val)) {
				const fullPath = (<unknown[]>[]).concat(path ?? [], key);
				return watch(val, fullPath, cb, opts, top || val, handlers, destructors);
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
