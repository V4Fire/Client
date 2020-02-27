/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import * as proxyEngine from 'core/object/watch/engines/proxy';
import * as accEngine from 'core/object/watch/engines/accessors';

import { WatchPath, WatchOptions, WatchHandler, Watcher } from 'core/object/watch/interface';

export * from 'core/object/watch/const';
export * from 'core/object/watch/interface';

/**
 * Watches for changes of the specified object
 *
 * @param obj
 * @param cb - callback that is invoked on every mutation hook
 * @param [opts] - additional options
 */
export function watch<T extends object>(obj: object, cb: WatchHandler, opts?: WatchOptions): Watcher<T>;

/**
 * Watches for changes of the specified object
 *
 * @param obj
 * @param path - path to a property to watch
 * @param cb - callback that is invoked on every mutation hook
 * @param [opts] - additional options
 */
export function watch<T extends object>(
	obj: object,
	path: WatchPath,
	cb: WatchHandler,
	opts?: WatchOptions
): Watcher<T>;

export function watch<T extends object>(
	obj: T,
	pathOrCb: WatchPath | WatchHandler,
	cbOrOpts?: WatchHandler | WatchOptions,
	opts?: WatchOptions
): Watcher<T> {
	let
		cb,
		timer,
		normalizedPath;

	if (Object.isString(pathOrCb) || Object.isArray(pathOrCb)) {
		normalizedPath = Object.isArray(pathOrCb) ? pathOrCb : pathOrCb.split('.');
		cb = <Function>cbOrOpts;

	} else {
		cb = <Function>pathOrCb;
		opts = <WatchOptions>cbOrOpts;
	}

	if (opts?.collapseToTopProperties) {
		const
			original = cb;

		cb = (val, oldVal, p) => {
			if (normalizedPath) {
				const
					path = p.path.length > normalizedPath.length ? p.path.slice(0, normalizedPath.length) : p.path;

				for (let i = 0; i < path.length; i++) {
					if (path[i] !== normalizedPath[i]) {
						return;
					}
				}
			}

			if (!timer) {
				// tslint:disable-next-line:no-string-literal
				timer = globalThis['setImmediate'](() => {
					original(p.isRoot ? val : p.top, p.isRoot ? oldVal : p.top, p);
					timer = undefined;
				});
			}
		};
	}

	if (typeof Proxy === 'function') {
		return proxyEngine.watch(obj, undefined, cb, opts);
	}

	return accEngine.watch(obj, undefined, cb, opts);
}

/**
 * Sets a new watchable value for an object by the specified path
 *
 * @param obj
 * @param path
 * @param value
 */
export function set(obj: object, path: WatchPath, value: unknown): void {
	return (typeof Proxy === 'function' ? proxyEngine : accEngine).set(obj, path, value);
}

/**
 * Unsets a watchable value for an object by the specified path
 *
 * @param obj
 * @param path
 */
export function unset(obj: object, path: WatchPath): void {
	return (typeof Proxy === 'function' ? proxyEngine : accEngine).unset(obj, path);
}
