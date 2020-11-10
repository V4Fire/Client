/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { MiddlewareParams } from 'models/demo';

export default {
	POST: [
		{
			response({opts}: MiddlewareParams): unknown {
				return opts.body;
			}
		}
	],

	PUT: [
		{
			response({opts}: MiddlewareParams): [string, unknown] {
				return [opts.method, opts.body];
			}
		}
	]
};
