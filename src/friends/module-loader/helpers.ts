/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { cache } from 'friends/module-loader/const';

import type ModuleLoader from 'friends/module-loader/class';
import type { Module, ResolvedModule } from 'friends/module-loader/interface';

/**
 * Resolves the specified module: if the module already exists in the cache, the function simply returns it.
 * Otherwise, the module will be loaded.
 *
 * @param module
 */
export function resolveModule(this: ModuleLoader, module: Module): CanPromise<ResolvedModule> {
	const
		{async: $a} = this;

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

			resolvedModule.promise = $a.promise(new Promise((r) => {
				if (module.wait) {
					r($a.promise(module.wait()).then(module.load.bind(module)));

				} else {
					r(module.load());
				}
			}));

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
