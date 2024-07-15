/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type Provider from 'core/data';

import type { HydrationCacheOptions } from 'core/data/middlewares/hydration-cache/interface';

export const defaultParams: HydrationCacheOptions = {
	cacheId(provider: Provider) {
		return provider.providerName;
	}
};
