/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { fromQueryString } from 'core/url';
import type { BrowserContext, Page, Route } from 'playwright';

import type { RequestState, RequestQuery } from 'tests/network-interceptors/pagination/interface';

export * from 'tests/network-interceptors/pagination/interface';

const requestStates: Dictionary<RequestState> = {

};

/**
 * Provides an API to intercepts and mock response to the '/pagination' request.
 * For convenient work, the interceptor processes the parameters passed to the request query -
 * {@link RequestQuery possible parameters}.
 *
 * @param pageOrContext
 */
export async function interceptPaginationRequest(
	pageOrContext: Page | BrowserContext
): Promise<void> {
	return pageOrContext.route(/api/, paginationHandler);
}

/**
 * Handler for intercepted pagination requests
 * @param route
 */
export async function paginationHandler(route: Route): Promise<void> {
	const routeQuery = fromQueryString(new URL(route.request().url()).search);

	const query = <RequestQuery>{
		chunkSize: 12,
		id: String(Math.random()),
		sleep: 100,
		...routeQuery
	};

	const res = {
		status: 200
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
		return route.fulfill({
			status: res.status,
			contentType: 'application/json',
			body: JSON.stringify([])
		});
	}

	const dataToSend = Array.from(Array(query.chunkSize), () => ({i: state.i++}));
	state.totalSent += dataToSend.length;

	return route.fulfill({
		status: res.status,
		contentType: 'application/json',
		body: JSON.stringify({
			...query.additionalData,
			data: dataToSend
		})
	});
}

async function sleep(t: number): Promise<void> {
	return new Promise((res) => {
		setTimeout(res, t);
	});
}
