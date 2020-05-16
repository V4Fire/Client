/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { MiddlewareParams, MockCustomResponse } from 'models/demo';
import request from '@v4fire/core/src/core/request';

async function sleep(t: number): Promise<void> {
	return new Promise((res, rej) => {
		setTimeout(res, t);
	});
}

const requestStates: any = {

};

export default {
	GET: [{
		async response({opts}: MiddlewareParams, res: MockCustomResponse): Promise<any> {
			await sleep(300);

			opts.query = {
				chunkSize: 12,
				id: Math.random(),
				...Object.isObject(opts.query) ? opts.query : {}
			};

			const s = requestStates[<string>opts.query.id] = requestStates[<string>opts.query.id] || {
				i: 0,
				totalSended: 0,
				...opts.query
			};

			if (s.totalSended === s.total) {
				return {data: []};
			}

			const
				dataToSend = Array.from(Array(opts.query.chunkSize), () => ({i: s.i++}));

			s.totalSended += dataToSend.length;

			return {
				data: dataToSend
			};
		}
	}]
};
