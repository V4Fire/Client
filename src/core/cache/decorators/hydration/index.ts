/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import HydrationCacheAdapter from 'core/cache/decorators/hydration/adapter';
import type { HydrationStore } from 'core/component';
import type Cache from 'core/cache/interface';

/**
 * Wraps the specified cache with the hydration adapter
 *
 * @param store
 * @param cache
 * @param id
 * @param cacheKey
 */
export const addHydrationCache =
	(store: HydrationStore, cache: Cache, id: string, cacheKey: string): Cache =>
		new HydrationCacheAdapter(store, cache, id, cacheKey).getInstance();
