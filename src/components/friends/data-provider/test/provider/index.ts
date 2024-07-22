/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { MiddlewareParams } from 'core/request';
import Provider, { DecodersMap, provider } from 'core/data';

export * from 'core/data';

@provider('test')
export default class FriendsDataProvider extends Provider {
	static override request: typeof Provider.request = Provider.request({
		cacheStrategy: 'never'
	});

	static override decoders: DecodersMap = {
		get: [
			(data: unknown, params: MiddlewareParams): Promise<unknown> => new Promise((resolve) => {
				params.opts.meta.provider?.emitter.emit('friendsDataProviderDecoder');

				setTimeout(() => resolve(data));
			})
		]
	};
}
