/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Then from 'core/then';
import Provider from 'core/data';
import { Response, MiddlewareParams } from 'core/request';

/**
 * Middleware: attaches mock data from .mocks
 *
 * @param opts
 * @param ctx
 */
export function attachMock(this: Provider, {opts, ctx}: MiddlewareParams): CanUndef<Function> {
	if (!this.mocks) {
		return;
	}

	const
		requests = this.mocks[<string>opts.method];

	if (!requests) {
		return;
	}

	const requestKeys = [
		'query',
		'body',
		'headers'
	];

	let
		currentRequest;

	for (let i = 0; i < requests.length; i++) {
		const
			request = requests[i];

		if (!request) {
			continue;
		}

		requestKeys: for (let keys = requestKeys, i = 0; i < keys.length; i++) {
			const
				key = keys[i];

			if (!(key in request)) {
				currentRequest = request;
				continue;
			}

			const
				val = request[key],
				baseVal = opts[key];

			if (Object.isObject(val)) {
				for (let keys = Object.keys(val), i = 0; i < keys.length; i++) {
					const
						key = keys[i];

					if (!Object.fastCompare(val[key], baseVal && baseVal[key])) {
						currentRequest = undefined;
						break requestKeys;
					}
				}

				currentRequest = request;
				continue;
			}

			if (Object.fastCompare(baseVal, val)) {
				currentRequest = request;
				continue;
			}

			currentRequest = undefined;
		}

		if (currentRequest) {
			break;
		}
	}

	if (!currentRequest) {
		return;
	}

	return () => Then.resolve(currentRequest.response, ctx.parent)
		.then((res) => new Response(res, {
			status: currentRequest.status || 200,
			responseType: currentRequest.responseType || opts.responseType,
			okStatuses: opts.okStatuses,
			decoder: currentRequest.decoders === false ? undefined : ctx.decoders
		}))

		.then(ctx.wrapAsResponse);
}
