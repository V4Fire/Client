/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type HydrationStore from 'core/hydration-store';
import type Cache from 'core/cache/interface';

import HydrationCacheAdapter from 'core/cache/decorators/hydration/adapter';
import type { HydrationCacheOptions } from 'core/cache/decorators/hydration/interface';

export * from 'core/cache/decorators/hydration/interface';

/**
 * Wraps the specified cache to integrate it with the hydration store
 *
 * @param cache - the cache instance that needs to be wrapped
 * @param store - the hydration store where cached data may be persisted or restored from
 * @param opts - additional cache options
 */
export const addHydrationCache =
	(cache: Cache, store: HydrationStore, opts: HydrationCacheOptions): Cache =>
		new HydrationCacheAdapter(cache, store, opts).getInstance();
