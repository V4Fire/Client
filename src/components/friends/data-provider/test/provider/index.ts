/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Provider, { provider } from 'core/data';

export * from 'core/data';

@provider('test')
export default class FriendsDataProvider extends Provider {
	static override request: typeof Provider.request = Provider.request({
		cacheStrategy: 'never'
	});
}
