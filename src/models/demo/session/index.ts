/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Demo, { provider } from '/models/demo';

@provider('demo')
export default class Session extends Demo {
	override baseURL: string = '/session';

	static override request: typeof Demo.request = Demo.request({
		api: {
			url: 'https://test.v4fire.rocks'
		}
	});
}
