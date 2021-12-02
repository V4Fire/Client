/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Demo, { provider, Mocks } from '@src/models/demo';

@provider('demo')
export default class Pagination extends Demo {
	override baseURL: string = '/pagination';
	override mocks: Mocks = import('@src/models/demo/pagination/mocks');
}
