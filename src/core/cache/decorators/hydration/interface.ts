/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

export interface HydrationCacheOptions {
	/**
	 * The unique identifier for the hydration store
	 */
	id: string;

	/**
	 * The cache key used to save and retrieve hydrated data
	 */
	cacheKey: string;
}
