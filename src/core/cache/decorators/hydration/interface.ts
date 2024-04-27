/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type HydrationCacheAdapter from 'core/cache/decorators/hydration/adapter';

export interface HydrationCacheOptions {
	/** {@link HydrationCacheAdapter.id} */
	id: string;

	/** {@link HydrationCacheAdapter.cacheKey} */
	cacheKey: string;
}
