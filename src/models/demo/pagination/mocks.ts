/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { MiddlewareParams, MockCustomResponse } from 'models/demo';

export default {
	GET: [{
		async response({opts}: MiddlewareParams, res: MockCustomResponse): Promise<any> {
			return {data: Array.from(Array(10), () => ({}))};
		}
	}]
};
