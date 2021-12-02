/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Demo, { provider, Mocks } from '@src/models/demo';

@provider('demo')
export default class NestedList extends Demo {
	override baseURL: string = '/nested-list';
	override mocks: Mocks = import('@src/models/demo/nested-list/mocks');
}
