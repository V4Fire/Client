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
 */
export function watch<T extends object>(obj: T, cb: WatchHandler): Watcher<T>;

/**
 * Watches for changes of the specified object
 *
 * @param obj
 * @param opts - additional options
 * @param cb - callback that is invoked on every mutation hook
 */
export function watch<T extends object>(obj: T, opts: WatchOptions, cb: WatchHandler): Watcher<T>;

/**
 * Watches for changes of the specified object
 *
 * @param obj
 * @param path - path to a property to watch
 * @param cb - callback that is invoked on every mutation hook
 */
export function watch<T extends object>(
	obj: T,
	// tslint:disable-next-line:unified-signatures
	path: WatchPath,
	cb: WatchHandler
): Watcher<T>;

/**
 * Watches for changes of the specified object
 *
 * @param obj
 * @param path - path to a property to watch
 * @param opts - additional options
 * @param cb - callback that is invoked on every mutation hook
 */
export function watch<T extends object>(
	obj: T,
	path: WatchPath,
	opts: WatchOptions,
	cb: WatchHandler
): Watcher<T>;

export function watch<T extends object>(
	obj: T,
	pathOptsOrCb: WatchPath | WatchHandler | WatchOptions,
	cbOrOpts?: WatchHandler | WatchOptions,
	optsOrCb?: WatchOptions | WatchHandler
): Watcher<T> {
	let
		cb,
		opts;

	let
		timer,
		normalizedPath;

	if (Object.isString(pathOptsOrCb) || Object.isArray(pathOptsOrCb)) {
		normalizedPath = Object.isArray(pathOptsOrCb) ? pathOptsOrCb : pathOptsOrCb.split('.');

		if (Object.isFunction(cbOrOpts)) {
			cb = cbOrOpts;

		} else {
			opts = cbOrOpts;
			cb = optsOrCb;
		}

	} else if (Object.isFunction(pathOptsOrCb)) {
		cb = pathOptsOrCb;

	} else {
		opts = pathOptsOrCb;
		cb = cbOrOpts;
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
