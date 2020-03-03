/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { watchLabel, watchHandlersLabel } from 'core/object/watch/const';

import * as proxyEngine from 'core/object/watch/engines/proxy';
import * as accEngine from 'core/object/watch/engines/accessors';

import { WatchPath, WatchOptions, WatchHandler, MultipleWatchHandler, Watcher } from 'core/object/watch/interface';

export * from 'core/object/watch/const';
export * from 'core/object/watch/interface';

/**
 * Watches for changes of the specified object
 *
 * @param obj
 * @param handler - callback that is invoked on every mutation hook
 */
export function watch<T extends object>(obj: T, handler: MultipleWatchHandler): Watcher<T>;

/**
 * Watches for changes of the specified object
 *
 * @param obj
 * @param opts - additional options
 * @param handler - callback that is invoked on every mutation hook
 */
export function watch<T extends object>(
	obj: T,
	opts: WatchOptions & ({immediate: true} | {collapse: true}),
	handler: WatchHandler
): Watcher<T>;

/**
 * Watches for changes of the specified object
 *
 * @param obj
 * @param opts - additional options
 * @param handler - callback that is invoked on every mutation hook
 */
export function watch<T extends object>(obj: T, opts: WatchOptions, handler: MultipleWatchHandler): Watcher<T>;

/**
 * Watches for changes of the specified object
 *
 * @param obj
 * @param path - path to a property to watch
 * @param handler - callback that is invoked on every mutation hook
 */
export function watch<T extends object>(
	obj: T,
	// tslint:disable-next-line:unified-signatures
	path: WatchPath,
	handler: MultipleWatchHandler
): Watcher<T>;

/**
 * Watches for changes of the specified object
 *
 * @param obj
 * @param path - path to a property to watch
 * @param opts - additional options
 * @param handler - callback that is invoked on every mutation hook
 */
export function watch<T extends object>(
	obj: T,
	path: WatchPath,
	opts: WatchOptions & ({immediate: true} | {collapse: true}),
	handler: WatchHandler
): Watcher<T>;

/**
 * Watches for changes of the specified object
 *
 * @param obj
 * @param path - path to a property to watch
 * @param opts - additional options
 * @param handler - callback that is invoked on every mutation hook
 */
export function watch<T extends object>(
	obj: T,
	path: WatchPath,
	opts: WatchOptions,
	handler: MultipleWatchHandler
): Watcher<T>;

export function watch<T extends object>(
	obj: T,
	pathOptsOrHandler: WatchPath | WatchHandler | MultipleWatchHandler | WatchOptions,
	handlerOrOpts?: WatchHandler | MultipleWatchHandler | WatchOptions,
	optsOrHandler?: WatchOptions | WatchHandler | MultipleWatchHandler
): Watcher<T> {
	let
		cb,
		opts: CanUndef<WatchOptions>;

	let
		timer,
		normalizedPath;

	if (Object.isString(pathOptsOrHandler) || Object.isArray(pathOptsOrHandler)) {
		normalizedPath = Object.isArray(pathOptsOrHandler) ? pathOptsOrHandler : pathOptsOrHandler.split('.');

		if (Object.isFunction(handlerOrOpts)) {
			cb = handlerOrOpts;

		} else {
			opts = handlerOrOpts;
			cb = optsOrHandler;
		}

	} else if (Object.isFunction(pathOptsOrHandler)) {
		cb = pathOptsOrHandler;

	} else {
		opts = pathOptsOrHandler;
		cb = handlerOrOpts;
	}

	const
		immediate = opts?.immediate,
		collapse = normalizedPath ? opts?.collapse !== false : opts?.collapse;

	const
		pref = opts?.prefixes,
		post = opts?.postfixes;

	let
		deps = opts?.dependencies;

	if (deps) {
		if (Object.isArray(deps)) {
			deps = deps.slice();

			for (let i = 0; i < deps.length; i++) {
				const dep = deps[i];
				deps[i] = Object.isArray(dep) ? dep : dep.split('.');
			}

		} else if (Object.isDictionary(deps)) {
			deps = {...deps};

			for (let keys = Object.keys(deps), i = 0; i < keys.length; i++) {
				const
					keyDeps = deps[keys[i]]!.slice();

				for (let i = 0; i < keyDeps.length; i++) {
					const dep = keyDeps[i];
					keyDeps[i] = Object.isArray(dep) ? dep : dep.split('.');
				}
			}
		}
	}

	if (!immediate || collapse || normalizedPath || deps) {
		const
			original = cb,
			NULL = {};

		let
			dynamicOldVal = NULL,
			argsQueue = <unknown[][]>[];

		cb = (val, oldVal, p) => {
			let
				dynamic = false;

			const fire = (path = normalizedPath) => {
				const getArgs = () => {
					if (dynamic) {
						val = Object.get(obj, collapse ? path[0] : path);

						if (original.length < 2) {
							return [val, undefined, p];
						}

						const args = [val, dynamicOldVal === NULL ? undefined : dynamicOldVal, p];
						dynamicOldVal = val;

						return args;
					}

					if (collapse) {
						return [p.isRoot ? val : p.top, p.isRoot ? oldVal : p.top, p];
					}

					return [val, oldVal, p];
				};

				if (immediate) {
					original(...getArgs());

				} else {
					if (collapse) {
						argsQueue = getArgs();

					} else {
						argsQueue.push(getArgs());
					}

					if (!timer) {
						// tslint:disable-next-line:no-string-literal
						timer = globalThis['setImmediate'](() => {
							timer = undefined;

							try {
								if (collapse) {
									original(...argsQueue);

								} else {
									original(argsQueue);
								}

							} finally {
								argsQueue = [];
							}
						});
					}
				}
			};

			if (normalizedPath) {
				const
					path = p.path.length > normalizedPath.length ? p.path.slice(0, normalizedPath.length) : p.path;

				path: for (let i = 0; i < path.length; i++) {
					const
						pathVal = path[i],
						normalizedPathVal = normalizedPath[i];

					if (pathVal === normalizedPathVal) {
						continue;
					}

					if (pref) {
						for (let i = 0; i < pref.length; i++) {
							if (pathVal === pref[i] + normalizedPathVal) {
								dynamic = true;
								continue path;
							}
						}

					} else if (post) {
						for (let i = 0; i < post.length; i++) {
							if (pathVal === normalizedPathVal + post[i]) {
								dynamic = true;
								continue path;
							}
						}
					}

					if (Object.isArray(deps)) {
						deps: for (let i = 0; i < deps.length; i++) {
							const
								depPath = deps[i],
								path = p.path.length > depPath.length ? p.path.slice(0, depPath.length) : p.path;

							for (let i = 0; i < path.length; i++) {
								if (path[i] === depPath[i]) {
									dynamic = true;
									continue;
								}

								continue deps;
							}

							break path;
						}
					}

					return;
				}

				fire();
				return;
			}

			fire();

			if (Object.isDictionary(deps)) {
				console.log(67, deps, deps[p.path[0]]);

				console.log(5656, p.path);
			}
		};
	}

	const
		mapTo = opts?.mapTo,
		res = (typeof Proxy === 'function' ? proxyEngine : accEngine).watch(obj, undefined, cb, opts),
		proxy = res.proxy;

	if (mapTo && Object.isSimpleObject(proxy)) {
		mapTo[watchLabel] = obj[watchLabel];
		mapTo[watchHandlersLabel] = obj[watchHandlersLabel];

		for (let keys = Object.keys(proxy), i = 0; i < keys.length; i++) {
			const
				key = keys[i];

			Object.defineProperty(mapTo, key, {
				enumerable: true,
				configurable: true,
				get(): unknown {
					return proxy[key];
				},

				set(val: unknown): void {
					proxy[key] = val;
				}
			});
		}
	}

	return res;
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

const data = {
	foo: 1,

	get bla() {
		return this.foo * 2;
	}
};

const component = {

};

const {unwatch} = watch(data, {mapTo: component, collapse: true}, (val, oldVal) => {
//console.log(11, val, oldVal);
});


watch(component, {dependencies: {foo: ['bla']}}, (val) => {
	console.log(val[0][0]);
});

component.foo = 2;
component.foo = 53;
