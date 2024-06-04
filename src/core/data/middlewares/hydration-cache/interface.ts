/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type Provider from 'core/data';

export interface HydrationCacheOptions {
	/**
	 * A function that takes a provider object and returns the identifier by which the provider's data
	 * will be stored in the cache
	 *
	 * @param provider
	 */
	cacheId(provider: Provider): string;
}
