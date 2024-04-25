/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Provider, { Middlewares, ProviderOptions, provider } from 'core/data';
import { HydrationStore } from 'core/component';

import { attachHydrationCache } from 'core/data/middlewares/hydration-cache';

export * from 'core/data';

@provider('test')
export default class HydrationCache extends Provider {
	static override request: typeof Provider.request = Provider.request({
		cacheStrategy: 'forever'
	});

	static override readonly middlewares: Middlewares = {
		...Provider.middlewares,
		attachHydrationCache
	};

	public constructor(opts?: ProviderOptions) {
		// Hydration store saves a data only for the server side
		if (opts?.remoteState != null) {
			opts.remoteState.hydrationStore = new HydrationStore('server');
		}

		super(opts);
	}
}
