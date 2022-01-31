/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:super/i-block/modules/module-loader/README.md]]
 * @packageDocumentation
 */

import Friend from '/super/i-block/modules/friend';

import { cache, cachedModules } from '/super/i-block/modules/module-loader/const';
import type { Module } from '/super/i-block/modules/module-loader/interface';

export * from '/super/i-block/modules/module-loader/interface';

let
	resolve,
	cursor;

/**
 * Class to load the dynamic dependencies of the component
 */
export default class ModuleLoader extends Friend {
	/**
	 * Number of added modules
	 */
	get size(): number {
		return cachedModules.length;
	}

	/**
	 * Returns true if the specified module already exists in the cache
	 * @param module
	 */
	has(module: Module): boolean {
		return module.id != null ? cache.has(module.id) : false;
	}

	/**
	 * Adds the specified modules to a queue to load.
	 * The method returns the number of added modules in the cache.
	 *
	 * @param modules
	 */
	add(...modules: Module[]): number {
		for (let i = 0; i < modules.length; i++) {
			const
				module = modules[i];

			if (module.id != null) {
				if (this.has(module)) {
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
	load(...modules: Module[]): CanPromise<boolean> {
		const
			toLoad = <Array<Promise<unknown>>>[];

		for (let i = 0; i < modules.length; i++) {
			const
				module = modules[i],
				val = this.resolveModule(module);

			if (Object.isPromise(val)) {
				toLoad.push(val);

				if (module.id != null) {
					cache.set(module.id, module);
				}

				cachedModules.push(module);
			}
		}

		if (toLoad.length === 0) {
			return false;
		}

		return this.async.promise(Promise.all(toLoad).then(() => true));
	}

	[Symbol.iterator](): IterableIterator<CanArray<Module>> {
		return this.values();
	}

	/**
	 * Returns an iterator to iterate the added modules.
	 * If there is no provided id to check, the iterator will never stop.
	 * The method should be used with [[AsyncRender]].
	 *
	 * @param [ids] - module identifiers to filter
	 */
	values(...ids: unknown[]): IterableIterator<CanArray<Module>> {
		const
			{async: $a} = this;

		let
			iterPos = 0,
			done = false,
			cachedLength = cachedModules.length;

		const
			idsSet = new Set(ids),
			subTasks = <Array<Promise<Module>>>[],
			subValues = <Array<CanPromise<Module>>>[];

		const iterator = {
			[Symbol.iterator]: () => iterator,

			next: () => {
				if (done) {
					return {
						done: true,
						value: undefined
					};
				}

				const initModule = (module: Module) => {
					cursor = undefined;
					resolve = undefined;

					if (ids.length > 0 && idsSet.has(module.id)) {
						idsSet.delete(module.id);
						done = idsSet.size === 0;

					} else if (cachedLength !== cachedModules.length) {
						iterPos++;
						cachedLength = cachedModules.length;
					}

					return this.resolveModule(module);
				};

				if (ids.length > 0) {
					for (let o = idsSet.values(), el = o.next(); !el.done; el = o.next()) {
						const
							id = el.value,
							module = cache.get(id);

						if (module != null) {
							idsSet.delete(id);

							const
								val = initModule(module);

							if (Object.isPromise(val)) {
								subTasks.push(val);
							}

							subValues.push(val);

							if (idsSet.size === 0) {
								done = true;

								return {
									done: false,
									value: subTasks.length > 0 ?
										$a.promise(Promise.all(subTasks).then(() => Promise.allSettled(subValues))) :
										subValues
								};
							}
						}
					}

				} else if (iterPos !== cachedLength) {
					return {
						done: false,
						value: initModule(cachedModules[iterPos++])
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
					value: $a.promise(new Promise((r) => {
						resolve = (module: Module) => {
							const
								val = initModule(module);

							if (Object.isPromise(val)) {
								return val.then(r);
							}

							r(val);
						};
					}))
				};

				return cursor;
			}
		};

		return iterator;
	}

	/**
	 * Resolves the specified module: if the module already exists in the cache, the method simply returns it.
	 * Otherwise, the module will be loaded.
	 *
	 * @param module
	 */
	protected resolveModule(module: Module): CanPromise<Module> {
		const
			{async: $a} = this;

		if (module.id != null) {
			module = cache.get(module.id) ?? module;
		}

		let
			promise;

		switch (module.status) {
			case 'loaded':
				break;

			case 'pending':
				promise = module.promise;
				break;

			default: {
				module.status = 'pending';
				module.promise = $a.promise(new Promise((r) => {
					if (module.wait) {
						r($a.promise(module.wait()).then(module.load.bind(module)));

					} else {
						r(module.load());
					}
				}));

				promise = module.promise
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
			return promise.then(() => module);
		}

		return module;
	}
}
