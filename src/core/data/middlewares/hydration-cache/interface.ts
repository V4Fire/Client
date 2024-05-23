/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */
import type Provider from 'core/data';

export interface HydrationCacheParams {
	/**
	 * The unique identifier of the hydration store
	 * @param provider
	 */
	cacheId(this: void, provider: Provider): string;
}
