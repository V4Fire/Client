/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Super, { provider, ProviderOptions } from '@v4fire/core/core/data';

export * from '@v4fire/core/core/data';

@provider
export default class Provider extends Super {
	override getCacheKey(paramsForCache: ProviderOptions = {}): string {
		return super.getCacheKey(Object.reject(paramsForCache, 'remoteState'));
	}
}
