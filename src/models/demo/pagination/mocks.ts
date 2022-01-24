/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { MiddlewareParams, MockCustomResponse } from '@src/models/demo';
import type { RequestState, RequestQuery, ResponseItem } from '@src/models/demo/pagination/interface';

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
			async response({opts}: MiddlewareParams, res: MockCustomResponse): Promise<CanUndef<{data: ResponseItem[]}>> {
				const query = <RequestQuery>{
					chunkSize: 12,
					id: String(Math.random()),
					sleep: 300,
					...Object.isDictionary(opts.query) ? opts.query : {}
				};

				await sleep(<number>query.sleep);

				// eslint-disable-next-line no-multi-assign
				const state = requestStates[query.id] = requestStates[query.id] ?? {
					i: 0,
					requestNumber: 0,
					totalSent: 0,
					failCount: 0,
					...query
				};

				const
					isFailCountNotReached = query.failCount != null ? state.failCount <= query.failCount : true;

				if (Object.isNumber(query.failOn) && query.failOn === state.requestNumber && isFailCountNotReached) {
					state.failCount++;
					res.status = 500;
					return undefined;
				}

				state.requestNumber++;

				if (state.totalSent === state.total) {
					return {
						...query.additionalData,
						data: []
					};
				}

				const dataToSend = Array.from(Array(query.chunkSize), () => ({i: state.i++}));
				state.totalSent += dataToSend.length;

				return {
					...query.additionalData,
					data: dataToSend
				};
			}
		}
	]
};
