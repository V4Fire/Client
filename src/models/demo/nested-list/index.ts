/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Demo, { provider, Mocks } from '~/models/demo';

@provider('demo')
export default class NestedList extends Demo {
	override baseURL: string = '/nested-list';
	override mocks: Mocks = import('~/models/demo/nested-list/mocks');
}
