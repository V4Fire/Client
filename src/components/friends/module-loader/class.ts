/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Friend, { fakeMethods } from 'components/friends/friend';
import type { Module } from 'components/friends/module-loader/interface';

interface ModuleLoader {
	load(...modules: Module[]): CanPromise<IterableIterator<Module[]>>;
	loadBucket(bucketName: string, ...modules: Module[]): number;
	addToBucket(bucketName: string): CanPromise<IterableIterator<Module[]>>;
}

@fakeMethods(
	'load',
	'loadBucket',
	'addToBucket'
)

interface SignalWaiter {
	promise: Promise<void>;
	resolver: CanUndef<Function>;
}

class ModuleLoader extends Friend {
	/**
	 * A dictionary with registered buckets to load
	 */
	protected moduleBuckets: Map<string, Set<Module>> = new Map();

	/**
	 * Registered signal waiters
	 * @private
	 */
	private readonly waiters: Map<string, CanUndef<SignalWaiter>> = new Map();

	/**
	 * Send signal to load modules by specified key
	 * @private
	 */
	sendSignal(key: string): void {
		let waiter = this.waiters.get(key);

		if (waiter === undefined) {
			waiter = {
				promise: Promise.resolve(),
				resolver: undefined
			};
			this.waiters.set(key, waiter);

		} else if (waiter.resolver !== undefined) {
			waiter.resolver();
			waiter.resolver = undefined;
		}
	}

	/**
	 * Returns a promise that resolves when the signal to load is sent
	 * @param key
	 */
	waitSignal(key: string): Function {
		const waiter = this.waiters.get(key)
		if (waiter) {
			return () => waiter.promise;
		}

		let resolver;
		const promise = new Promise<void>( (resolve) => resolver = resolve)
		this.waiters.set(key, {promise, resolver});

		return () => promise;
	}
}

export default ModuleLoader;
