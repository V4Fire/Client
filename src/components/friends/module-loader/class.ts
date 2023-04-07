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

class ModuleLoader extends Friend {
	/**
	 * A dictionary with registered buckets to load
	 */
	protected moduleBuckets: Map<string, Set<Module>> = new Map();
}

export default ModuleLoader;
