/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:core/module-loader/README.md]]
 * @packageDocumentation
 */

import { cache, cachedModules } from 'core/module-loader/const';
import type { Module, ResolvedModule } from 'core/module-loader/interface';

export * from 'core/module-loader/interface';

let
	resolve,
	cursor;

/**
 * Returns the number of added modules
 */
export function size(): number {
	return cachedModules.length;
}

/**
 * Returns true if a module by the passed identifier already exists in the cache
 * @param id
 */
export function has(id: unknown): boolean {
	return cache.has(id);
}

/**
 * Adds the specified modules to a queue to load.
 * The method returns the number of added modules in the cache.
 *
 * @param modules
 */
export function add(...modules: Module[]): number {
	for (let i = 0; i < modules.length; i++) {
		const
			module = modules[i];

		if (module.id != null) {
			if (has(module.id)) {
				continue;
			}

			cache.set(module.id, module);
		}

		if (Object.isFunction(resolve)) {
			resolve(module);
		}
	}

	return cache.size;
}

/**
 * Loads the specified modules.
 * The method returns false if there is nothing to load.
 */
export function load(...modules: Module[]): CanPromise<boolean> {
	const
		toLoad: Array<Promise<unknown>> = [];

	for (let i = 0; i < modules.length; i++) {
		const
			module = modules[i],
			resolvedModule = resolveModule(module);

		if (Object.isPromise(resolvedModule)) {
			toLoad.push(resolvedModule);

			if (module.id != null) {
				cache.set(module.id, module);
			}

			cachedModules.push(module);
		}
	}

	if (toLoad.length === 0) {
		return false;
	}

	return Promise.all(toLoad).then(() => true);
}

/**
 * Returns an iterator over the added modules.
 * If there are no provided identifiers to check, the iterator will never stop.
 *
 * @param [ids] - module identifiers to filter
 */
export function values(...ids: unknown[]): IterableIterator<CanArray<Module>> {
	let
		cachedLength = cachedModules.length;

	let
		iterPos = 0,
		done = false;

	const
		idsSet = new Set(ids),
		subTasks: Array<Promise<ResolvedModule>> = [],
		subValues: Array<CanPromise<ResolvedModule>> = [];

	const iterator = {
		[Symbol.iterator]() {
			return this;
		},

		next() {
			if (done) {
				return {
					done: true,
					value: undefined
				};
			}

			if (ids.length > 0) {
				for (let o = idsSet.values(), el = o.next(); !el.done; el = o.next()) {
					const
						id = el.value,
						module = cache.get(id);

					if (module != null) {
						idsSet.delete(id);

						const
							resolvedModule = getResolvedModule(module);

						if (Object.isPromise(resolvedModule)) {
							subTasks.push(resolvedModule);
						}

						subValues.push(resolvedModule);

						if (idsSet.size === 0) {
							done = true;

							return {
								done: false,
								value: subTasks.length > 0 ?
									Promise.all(subTasks).then(() => Promise.allSettled(subValues)) :
									subValues
							};
						}
					}
				}

			} else if (iterPos !== cachedLength) {
				return {
					done: false,
					value: getResolvedModule(cachedModules[iterPos++])
				};
			}

			if (cursor != null) {
				if (ids.length > 0) {
					return {
						done: false,
						value: cursor.value.then((module) => {
							if (done) {
								return module;
							}

							return iterator.next().value;
						})
					};
				}

				return cursor;
			}

			cursor = {
				done: false,
				value: new Promise((r) => {
					resolve = (module: Module) => {
						const
							resolvedModule = getResolvedModule(module);

						if (Object.isPromise(resolvedModule)) {
							return resolvedModule.then(r);
						}

						r(resolvedModule);
					};
				})
			};

			return cursor;
		}
	};

	return iterator;

	function getResolvedModule(module: Module): CanPromise<ResolvedModule> {
		cursor = undefined;
		resolve = undefined;

		if (ids.length > 0 && idsSet.has(module.id)) {
			idsSet.delete(module.id);
			done = idsSet.size === 0;

		} else if (cachedLength !== cachedModules.length) {
			iterPos++;
			cachedLength = cachedModules.length;
		}

		return resolveModule(module);
	}
}

/**
 * Resolves the specified module: if the module already exists in the cache, the function simply returns it.
 * Otherwise, the module will be loaded.
 *
 * @param module
 */
function resolveModule(module: Module): CanPromise<ResolvedModule> {
	let
		resolvedModule: ResolvedModule;

	if (module.id != null) {
		resolvedModule = Object.cast(cache.get(module.id) ?? module);

	} else {
		resolvedModule = Object.cast(module);
	}

	let
		promise;

	switch (resolvedModule.status) {
		case 'loaded':
			break;

		case 'pending':
			promise = resolvedModule.promise;
			break;

		default: {
			resolvedModule.status = 'pending';

			resolvedModule.promise = new Promise((r) => {
				if (module.wait) {
					r(module.wait().then(module.load.bind(module)));

				} else {
					r(module.load());
				}
			});

			promise = resolvedModule.promise
				.then(() => {
					module.status = 'loaded';
				})

				.catch((err) => {
					stderr(err);
					module.status = 'failed';
				});
		}
	}

	if (promise != null) {
		return promise.then(() => resolvedModule);
	}

	return resolvedModule;
}
