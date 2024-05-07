/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type Provider from 'core/data';
import type { MiddlewareParams } from 'core/request';

// @ts-ignore (vue/webstorm)
import { addHydrationCache } from 'core/cache/decorators/hydration';

//#if runtime has dummyComponents
import('core/data/middlewares/hydration-cache/test/provider');
//#endif

/**
 * Attaches a hydration cache to the specified context
 * @param middlewareParams
 */
export function attachHydrationCache(this: Provider, middlewareParams: MiddlewareParams): void {
	const
		{ctx} = middlewareParams;

	middlewareParams.ctx.isReady.then(() => {
		if (this.params.remoteState?.hydrationStore == null) {
			return;
		}

		const
			{cache, params} = ctx,
			{url} = params.api ?? {};

		const cacheKey = Object.fastHash({
			id: this.cacheId,
			query: params.querySerializer(ctx.query),
			api: Object.isFunction(url) ? url(middlewareParams) : url,
			cacheStrategy: params.cacheStrategy,
			method: params.method
		});

		const withHydrationCache = addHydrationCache(
			cache,
			this.params.remoteState.hydrationStore,

			{
				id: this.cacheId,
				cacheKey
			}
		);

		Object.set(ctx, 'cache', withHydrationCache);
	}).catch(stderr);
}
