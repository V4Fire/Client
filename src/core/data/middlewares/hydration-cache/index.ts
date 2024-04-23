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
	params.ctx.isReady.then(() => {
		if (this.params.remoteState?.hydrationStore == null) {
			return;
		}

		const {cache} = params.ctx;

		const withHydrationCache = addHydrationCache(this.params.remoteState.hydrationStore, cache, this.cacheId);

		Object.set(params.ctx, 'cache', withHydrationCache);
	}).catch(stderr);
}
