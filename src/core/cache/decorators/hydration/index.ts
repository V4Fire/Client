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
 * @param cache - cache to wrap
 * @param store - hydration store
 * @param options - hydration cache options
 *
 * @example
 * ```typescript
 * import { addHydrationCache } from 'core/cache/decorators/hydration';
 *
 * import SimpleCache from 'core/cache/simple';
 * import HydrationStore from 'core/hydration-store';
 *
 * const
 * cache = new SimpleCache(),
 * hydrationStore = new HydrationStore();
 *
 * const
 *   id = 'uniqueKeyForTheHydration',
 *   cacheKey = 'cacheKey';
 *
 * hydrationStore.init(id);
 * hydrationStore.set('foo', {key: 'value'});
 *
 * const
 *   hydrationCache = addHydrationCache(cache, hydrationStore, {id, cacheKey});
 *
 * hydrationCache.get('foo'); // {key: 'value'}
 * ```
 */
export const addHydrationCache =
	(cache: Cache, store: HydrationStore, options: HydrationCacheOptions): Cache =>
		new HydrationCacheAdapter(cache, store, options).getInstance();
