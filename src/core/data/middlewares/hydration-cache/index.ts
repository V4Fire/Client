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
	if (this.params.remoteState?.hydrationStore == null) {
		return;
	}

	const {cache} = params.ctx;

	this.params.remoteState.hydrationStore.init(this.cacheId);
	const hydrationCache = addHydrationCache(this.params.remoteState.hydrationStore, cache, this.cacheId);

	Object.defineProperty(params.ctx, 'cache', {
		enumerable: true,
		configurable: true,
		writable: false,
		value: hydrationCache
	});
}
