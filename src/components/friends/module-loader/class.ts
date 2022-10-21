/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Friend, { fakeMethods } from 'components/friends/friend';

import type * as api from 'components/friends/module-loader/api';
import type { Module } from 'components/friends/module-loader/interface';

interface ModuleLoader {
	load: typeof api.load;
	loadBucket: typeof api.loadBucket;
	addToBucket: typeof api.addToBucket;
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
