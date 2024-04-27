/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type HydrationStore from 'core/hydration-store';
import type Cache from 'core/cache/interface';

export default class HydrationCacheAdapter {
	/**
	 * Storage to save hydrated data
	 */
	private readonly store: HydrationStore;

	/**
	 * Original cache object
	 */
	private readonly cache: Cache;

	/**
	 * Wrapped cache object
	 */
	private readonly wrappedCache: Cache;

	/**
	 * Unique identifier of the hydration store
	 */
	private readonly id: string;

	/**
	 * Cache key to save hydrated data
	 */
	private readonly cacheKey: string;

	constructor(store: HydrationStore, cache: Cache, id: string, cacheKey: string) {
		this.store = store;
		this.cache = cache;
		this.wrappedCache = Object.create(cache);
		this.id = id;
		this.cacheKey = cacheKey;
	}

	/**
	 * Returns the wrapped cache object
	 */
	getInstance(): Cache {
		this.implementAPI();

		return this.wrappedCache;
	}

	/**
	 * Initializes the adapter
	 */
	protected implementAPI(): void {
		this.wrappedCache.get = this.get.bind(this);
		this.wrappedCache.set = this.set.bind(this);
		this.wrappedCache.has = this.has.bind(this);
	}

	/**
	 * Returns the value from the cache by the specified key
	 * @param key
	 */
	protected get(key: string): CanUndef<unknown> {
		const fromHydrationStore = this.store.get(this.id, this.cacheKey);

		if (!SSR) {
			this.store.remove(this.id, this.cacheKey);

			if (fromHydrationStore != null) {
				this.cache.set(key, fromHydrationStore);
			}
		}

		return fromHydrationStore ?? this.cache.get(key);
	}

	/**
	 * Saves a value to the cache by the specified key
	 *
	 * @param key
	 * @param value
	 */
	protected set(key: string, value: unknown): unknown {
		this.store.set(this.id, this.cacheKey, Object.cast(value));

		return this.cache.set(key, value);
	}

	/**
	 * Returns true if a value by the specified key exists in the cache
	 * @param key
	 */
	protected has(key: string): boolean {
		const fromHydrationStore = this.store.get(this.id, this.cacheKey);

		if (fromHydrationStore != null) {
			return true;
		}

		return this.cache.has(key);
	}
}
