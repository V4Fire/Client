/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Friend, { fakeMethods } from 'components/friends/friend';
import type { Module, Signal } from 'components/friends/module-loader/interface';

//#if runtime has dummyComponents
import('components/friends/module-loader/test/b-friends-module-loader-dummy');
//#endif

interface ModuleLoader {
	load(...modules: Module[]): CanPromise<IterableIterator<Module[]>>;
	loadBucket(bucketName: string, ...modules: Module[]): number;
	addToBucket(bucketName: string): CanPromise<IterableIterator<Module[]>>;
	sendSignal(signal: string): void;
	waitSignal(signal: string): () => Promise<void>;
}

@fakeMethods(
	'load',
	'loadBucket',
	'addToBucket',
	'sendSignal',
	'waitSignal'
)

class ModuleLoader extends Friend {
	/**
	 * A dictionary with registered buckets to load
	 */
	protected moduleBuckets: Map<string, Set<Module>> = new Map();

	/**
	 * Registered signals
	 */
	protected readonly signals: Map<string, CanUndef<Signal>> = new Map();
}

export default ModuleLoader;
