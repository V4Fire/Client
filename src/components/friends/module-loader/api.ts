/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type Friend from 'components/friends/friend';
import type ModuleLoader from 'components/friends/module-loader/class';

import { cache } from 'components/friends/module-loader/const';
import type { Module, ResolvedModule } from 'components/friends/module-loader/interface';

/**
 * Loads the specified modules.
 * If some modules are already loaded, they won't be loaded again.
 * If all specified modules are already loaded, the function returns a simple value instead of a promise.
 * The resulting value is intended for use with [[AsyncRender]].
 *
 * @param modules
 */
export function load(this: Friend, ...modules: Module[]): CanPromise<IterableIterator<Module[]>> {
	const
		tasks: Array<Promise<unknown>> = [];

	modules.forEach((module) => {
		if (module.ssr === false && SSR) {
			return;
		}

		const
			resolvedModule = resolveModule.call(this, module);

		if (Object.isPromise(resolvedModule)) {
			tasks.push(resolvedModule);
		}
	});

	const
		i = [modules].values();

	if (tasks.length === 0) {
		return i;
	}

	return this.async.promise(Promise.all(tasks)).then(() => i);
}

/**
 * Adds the specified modules to a load bucket under the passed name.
 * Note that adding modules does not trigger their loading.
 * To load the created bucket, use the `loadBucket` method.
 * The function returns the number of modules added to the bucket.
 *
 * @param bucketName
 * @param modules
 */
export function addToBucket(this: ModuleLoader, bucketName: string, ...modules: Module[]): number {
	let
		bucket = this.moduleBuckets.get(bucketName);

	if (bucket == null) {
		bucket = new Set();
		this.moduleBuckets.set(bucketName, bucket);
	}

	modules.forEach((module) => {
		if (module.id != null) {
			if (!cache.has(module.id)) {
				cache.set(module.id, module);
			}
		}

		bucket!.add(module);
	});

	return bucket.size;
}

/**
 * Loads a bucket of modules by the specified name.
 * If some modules are already loaded, they won't be loaded again.
 * If all specified modules are already loaded, the function returns a simple value instead of a promise.
 * The resulting value is intended for use with [[AsyncRender]].
 *
 * @param bucketName
 */
export function loadBucket(this: ModuleLoader, bucketName: string): CanPromise<IterableIterator<Module[]>> {
	const bucket = this.moduleBuckets.get(bucketName) ?? new Set();
	return load.call(this, ...bucket);
}

/**
 * Resolves the specified module: if the module already exists in the cache, it simply returns the existing one.
 * If not, the module will be loaded.
 *
 * @param module
 */
export function resolveModule(this: Friend, module: Module): CanPromise<ResolvedModule> {
	let
		resolvedModule: ResolvedModule;

	if (module.id != null) {
		resolvedModule = Object.cast(cache.get(module.id) ?? module);

	} else {
		resolvedModule = Object.cast(module);
	}

	let
		promise: CanUndef<Promise<unknown>>;

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

/**
 * Sends a signal to load the modules associated with the specified name
 * @param signalName
 */
export function sendSignal(this: ModuleLoader, signalName: string): void {
	let signal = this.signals.get(signalName);

	if (signal == null) {
		signal = {
			promise: Promise.resolve(),
			resolver: undefined
		};

		this.signals.set(signalName, signal);

	} else if (signal.resolver != null) {
		signal.resolver();
		signal.resolver = undefined;
	}
}

/**
 * Returns a function that, when called, returns a promise.
 * This promise resolves when the signal to load the associated modules is received.
 * The resulting value is intended for use with [[AsyncRender]].
 *
 * @param signalName
 */
export function waitSignal(this: ModuleLoader, signalName: string): () => Promise<void> {
	const signal = this.signals.get(signalName);

	if (signal != null) {
		return () => signal.promise;
	}

	let resolver: Function;
	const promise = new Promise<void>((resolve) => resolver = resolve);
	this.signals.set(signalName, {promise, resolver: resolver!});

	return () => promise;
}
