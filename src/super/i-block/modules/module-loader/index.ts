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

import Friend from 'super/i-block/modules/friend';

import { cache, modules } from 'super/i-block/modules/module-loader/const';
import { Module } from 'super/i-block/modules/module-loader/interface';

export * from 'super/i-block/modules/module-loader/interface';

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
		return modules.length;
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

			modules.push(module);

			if (Object.isFunction(resolve)) {
				resolve(module);
			}
		}

		return modules.length;
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
				module = modules[i];

			const
				val = this.resolveModule(module);

			if (Object.isPromise(val)) {
				toLoad.push(val);
			}
		}

		if (toLoad.length === 0) {
			return false;
		}

		return Promise.all(toLoad).then(() => true);
	}

	[Symbol.iterator](): IterableIterator<Module> {
		return this.values();
	}

	/**
	 * Returns an iterator to iterate the added modules.
	 * If there is no provided id to check, the iterator will never stop.
	 * The method should be used with [[AsyncRender]].
	 *
	 * @param [id] - module identifier to filter
	 */
	values(id?: unknown): IterableIterator<Module> {
		let
			iterPos = 0,
			done = false,
			cachedLength = modules.length;

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

					if (id != null && module.id === id) {
						done = true;

					} else if (cachedLength !== modules.length) {
						iterPos++;
						cachedLength = modules.length;
					}

					return this.resolveModule(module);
				};

				if (id != null) {
					const
						module = cache.get(id);

					if (module != null) {
						return {
							done: false,
							value: initModule(module)
						};
					}

				} else if (iterPos !== modules.length) {
					return {
						done: false,
						value: initModule(modules[iterPos++])
					};
				}

				if (cursor != null) {
					if (id != null) {
						return {
							done: false,
							value: cursor.value.then((res) => {
								if (done) {
									return res;
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
								val = initModule(module);

							if (Object.isPromise(val)) {
								return val.then(r);
							}

							r(val);
						};
					})
				};

				return cursor;
			}
		};

		return iterator;
	}

	/**
	 * Resolves the specified module: if the module already exists in the cache, the method simply returns it.
	 * Otherwise, the module will be loaded.
	 * @param module
	 */
	protected resolveModule(module: Module): CanPromise<Module> {
		if (module.id != null) {
			module = cache.get(module.id) ?? module;
			cache.set(module.id, module);
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
				const
					promises = module.load();

				module.status = 'pending';
				module.promise = promises.length > 1 ?
					Promise.all([promises[0], Promise.allSettled(promises.slice(1))]) :
					promises[0];

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
