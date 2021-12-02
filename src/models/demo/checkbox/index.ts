/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Demo, { provider, Mocks } from '~/models/demo';

@provider('demo')
export default class Checkbox extends Demo {
	override baseURL: string = '/checkbox';
	override mocks: Mocks = import('~/models/demo/checkbox/mocks');
}
