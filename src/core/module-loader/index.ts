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

import { cache } from 'core/module-loader/const';
import type { Module, ResolvedModule } from 'core/module-loader/interface';

export * from 'core/module-loader/const';
export * from 'core/module-loader/interface';

/**
 * Loads the specified modules.
 * If some modules are already loaded, they won’t be loaded twice.
 * If all specified modules are already loaded, the function returns a simple value, but not a promise.
 *
 * @param modules
 */
export function load(...modules: Module[]): CanPromise<void> {
	const
		tasks: Array<Promise<unknown>> = [];

	for (let i = 0; i < modules.length; i++) {
		const
			module = modules[i],
			resolvedModule = resolveModule(module);

		if (Object.isPromise(resolvedModule)) {
			tasks.push(resolvedModule);
		}
	}

	if (tasks.length === 0) {
		return;
	}

	return Promise.all(tasks).then(() => undefined);
}

/**
 * Resolves the specified module: if the module already exists in the cache, the function simply returns it.
 * Otherwise, the module will be loaded.
 *
 * @param module
 */
export function resolveModule(module: Module): CanPromise<ResolvedModule> {
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
			resolvedModule.promise = module.load();

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
