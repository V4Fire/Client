/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Demo, { provider, Mocks } from 'models/demo';

@provider('demo')
export class Form extends Demo {
	override baseURL: string = '/form';
	override mocks: Mocks = import('/models/demo/form/mocks');
}
