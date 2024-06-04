/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type Provider from 'core/data';
import type { MiddlewareParams } from 'core/request';

import { defaultParams } from 'core/data/middlewares/hydration-cache/const';
import { addHydrationCache } from 'core/cache/decorators/hydration';

import type { HydrationCacheOptions } from 'core/data/middlewares/hydration-cache/interface';

//#if runtime has dummyComponents
import('core/data/middlewares/hydration-cache/test/provider');
//#endif

export * from 'core/data/middlewares/hydration-cache/interface';

/**
 * Returns middleware that facilitates the utilization of data from the hydration store as a cache object
 * @param [opts] - additional options
 */
export function attachHydrationCache(opts: HydrationCacheOptions = defaultParams) {
	return function middlewareWrapper(this: Provider, middlewareParams: MiddlewareParams): void {
		const
			{ctx} = middlewareParams,
			{cacheId} = opts;

		ctx.isReady.then(() => {
			if (this.params.remoteState?.hydrationStore == null) {
				return;
			}

			const
				{cache, params} = ctx,
				{url} = params.api ?? {};

			const cacheKey = Object.fastHash({
				id: cacheId(this),
				query: params.querySerializer(ctx.query),
				api: Object.isFunction(url) ? url(middlewareParams) : url,
				cacheStrategy: params.cacheStrategy,
				method: params.method
			});

			const withHydrationCache = addHydrationCache(
				cache,
				this.params.remoteState.hydrationStore,

				{
					id: cacheId(this),
					cacheKey
				}
			);

			Object.set(ctx, 'cache', withHydrationCache);
		}).catch(stderr);
	};
}
