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

import { moduleCache } from 'super/i-block/modules/module-loader/const';
import { Module } from 'super/i-block/modules/module-loader/interface';

export * from 'super/i-block/modules/module-loader/interface';

/**
 * Class to load the dynamic dependencies of the component
 */
export default class ModuleLoader extends Friend {
	/**
	 * List of loaded dependencies
	 */
	protected cache: Map<unknown, unknown> = moduleCache;

	/**
	 * Returns a module by the specified id
	 * @param id
	 */
	get<M = unknown>(id: unknown): CanUndef<M> {
		return <any>this.cache.get(id);
	}

	/**
	 * Returns true if the requested module already exists in the cache
	 * @param id
	 */
	has(id: unknown): boolean {
		return this.cache.has(id);
	}

	createFilter(name: string): Function {
		return (module: Module) => {
			if (module.id !== name) {
				return false;
			}

			const
				val = this.get(name);

			if (val == null) {
				return false;
			}

			if (Object.isPromise(val)) {
				return val.then((mod) => {
					console.log(mod);
					return true;
				});
			}

			return true;
		};
	}

	/**
	 * Loads the specified dependencies
	 */
	load(...modules: Module[]): CanPromise<boolean> {
		const
			toLoad = <Array<Promise<unknown>>>[];

		for (let i = 0; i < modules.length; i++) {
			const
				module = modules[i];

			const
				{id} = module;

			if (id != null && this.has(id)) {
				continue;
			}

			const
				promise = Promise.allSettled(module.load());

			if (id != null) {
				this.cache.set(id, promise);
			}

			toLoad.push(
				promise.then((module) => {
					if (id != null) {
						console.log(3434);
						this.cache.originalSet(id, module);
					}
				})
			);
		}

		if (toLoad.length === 0) {
			return false;
		}

		return Promise.all(toLoad).then(() => true);
	}
}
