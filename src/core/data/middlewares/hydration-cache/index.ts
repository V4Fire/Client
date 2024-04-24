/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */
import type { MiddlewareParams } from 'core/request';

import type Provider from 'core/data';
import { addHydrationCache } from 'core/cache/decorators/hydration';

/**
 * Attaches a hydration cache to the specified context
 * @param params
 */
export function attachHydrationCache(this: Provider, params: MiddlewareParams): void {
	const
		{ctx} = params;

	ctx.isReady.then(() => {
		if (this.params.remoteState?.hydrationStore == null) {
			return;
		}

		const
			{cache, params} = ctx,
			{url} = params.api ?? {};

		const cacheKey = Object.fastHash({
			query: params.querySerializer(ctx.query),
			api: Object.isFunction(url) ? url() : url,
			cacheStrategy: params.cacheStrategy,
			method: params.method
		});

		const withHydrationCache = addHydrationCache(
			this.params.remoteState.hydrationStore,
			cache,
			this.cacheId,
			cacheKey
		);

		Object.set(ctx, 'cache', withHydrationCache);
	}).catch(stderr);
}
