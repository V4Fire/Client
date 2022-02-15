/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Demo, { provider, Mocks } from 'models/demo';

@provider('demo')
export class Input extends Demo {
	override baseURL: string = '/input';
	override mocks: Mocks = import('models/demo/input/mocks');
}

@provider('demo')
export class InputValue extends Input {
	static override request: typeof Input.request = Input.request({
		responseType: 'text',
		query: {value: 1}
	});
}
