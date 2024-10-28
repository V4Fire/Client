/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Super, { provider } from 'models/modules/session';

export * from 'models/modules/session';

@provider('test')
export default class Session extends Super {
	override baseURL: string = '/session';

	static override request: typeof Super.request = Super.request({
		responseType: 'json',
		cacheStrategy: 'never',
		api: {
			url: 'http://test_url.com'
		}
	});
}
