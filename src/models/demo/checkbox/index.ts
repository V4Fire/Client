/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Demo, { provider, Mocks } from 'models/demo';

@provider('demo')
export default class Checkbox extends Demo {
	override mocks: Mocks = import('models/demo/checkbox/mocks');

	static override request: typeof Demo.request = Demo.request({
		api: {
			// https://beeceptor.com/console/v4-test-json
			// отвечает со статусом 400 и телом ответа {"error":{"code":400,"message":"test message","description":"test desc","title":"test tile"}}
			url: () => 'https://v4-test-json.free.beeceptor.com/test'
		}
	});
}
