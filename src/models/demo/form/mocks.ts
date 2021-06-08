/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { MiddlewareParams } from 'models/demo';

export default {
	POST: [
		{
			response({ctx, opts}: MiddlewareParams): unknown {
				const url = ctx.resolveRequest();
				return [url, opts.method, opts.body];
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
