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
 * Watches for changes of the specified object by using accessors
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
 * Watches for changes of the specified object by using accessors
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

	let
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

	if (!Object.isPlainObject(obj)) {
		bindMutationHooks(<any>obj, {path, isRoot: Boolean(path)}, handlers!);
	}

	proxy = obj[watchLabel] = Object.create(<any>obj);

	for (let keys = Object.keys(obj), i = 0; i < keys.length; i++) {
		const
			key = keys[i],
			descriptors = Object.getOwnPropertyDescriptor(obj, key);

		if (descriptors?.configurable) {
			Object.defineProperty(proxy, key, {
				enumerable: true,
				configurable: true,

				get(): unknown {
					const
						val = obj[key];

					if (opts?.deep && canProxy(val)) {
						const fullPath = (<unknown[]>[]).concat(path ?? [], key);
						return watch(val, fullPath, cb, opts, top || val, handlers, destructors);
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
	}

	return returnProxy(obj, proxy);
}
