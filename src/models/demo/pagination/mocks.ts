/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { MiddlewareParams } from 'models/demo';
import { RequestState, RequestQuery, ResponseItem } from 'models/demo/pagination/interface';

async function sleep(t: number): Promise<void> {
	return new Promise((res) => {
		setTimeout(res, t);
	});
}

const requestStates: Dictionary<RequestState> = {

};

export default {
	GET: [
		{
			async response({opts}: MiddlewareParams): Promise<{data: ResponseItem[]}> {
				const query = <RequestQuery>{
					chunkSize: 12,
					id: String(Math.random()),
					sleep: 300,
					...Object.isObject(opts.query) ? opts.query : {}
				};

				await sleep(<number>query.sleep);

				// eslint-disable-next-line no-multi-assign
				const state = requestStates[query.id] = requestStates[query.id] ?? {
					i: 0,
					totalSent: 0,
					...query
				};

				if (state.totalSent === state.total) {
					return {
						data: []
					};
				}

				const dataToSend = Array.from(Array(query.chunkSize), () => ({i: state.i++}));
				state.totalSent += dataToSend.length;

				return {
					data: dataToSend
				};
			}
		}
	]
};
