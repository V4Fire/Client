/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Friend from 'friends/friend';

import type * as api from 'friends/module-loader/api';
import type { Module } from 'friends/module-loader/interface';

interface ModuleLoader {
	load: typeof api.load;
	loadBucket: typeof api.loadBucket;
	addModulesToBucket: typeof api.addModulesToBucket;
}

class ModuleLoader extends Friend {
	/**
	 * A map of registered buckets to load
	 */
	protected loadBuckets: Map<string, Set<Module>> = new Map();
}

export default ModuleLoader;
