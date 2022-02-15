/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Demo, { provider, Mocks } from 'models/demo';

@provider('demo')
export class Select extends Demo {
	override baseURL: string = '/input';
	override mocks: Mocks = import('models/demo/select/mocks');
}

@provider('demo')
export class SelectValue extends Select {
	static override request: typeof Select.request = Select.request({
		responseType: 'text',
		query: {value: 1}
	});
}
