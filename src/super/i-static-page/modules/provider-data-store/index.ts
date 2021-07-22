/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:super/i-static-page/modules/provider-data-store/README.md]]
 * @packageDocumentation
 */

import type { AbstractCache } from 'core/cache';
import ProviderDataItem from 'super/i-static-page/modules/provider-data-store/item';

export { ProviderDataItem };

/**
 * Creates a cache to store data of data providers based on the specified cache API
 * @param cache
 */
export default function createProviderDataStore(
	cache: AbstractCache
): Overwrite<AbstractCache<ProviderDataItem>, {set<T>(key: string, value: T): ProviderDataItem<T>}> {
	const
		wrappedCache = Object.create(cache);

	wrappedCache.set = function set(key: string, value: unknown): unknown {
		const item = new ProviderDataItem(key, value);
		cache.set.call(this, key, item);
		return item;
	};

	return wrappedCache;
}
