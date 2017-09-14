'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { convertDate } from 'core/json';

const
	$C = require('collection.js'),
	URI = require('urijs'),
	joinUri = require('join-uri'),
	uuid = require('uuid');

const
	requests = Object.create(null),
	cache = Object.create(null);

export class RequestError {
	/**
	 * Error arguments
	 */
	args: Object;

	/**
	 * Error type
	 */
	type: string;

	/**
	 * Error code
	 */
	code: number;

	/**
	 * @param type - error type
	 * @param args - error arguments
	 */
	constructor(type: string, args: Object) {
		this.args = args;
		this.type = type;
		this.code = args[0].status;
	}
}

export default request;
export type $$requestParams = {
	method?: string,
	timeout?: number,
	defer?: number,
	contentType?: string,
	responseType?: string,
	headers?: Object,
	body?: any,
	withCredentials?: boolean,
	user?: string,
	password?: string,
	status?: Array | RegExp | number,
	onAbort?: (transport: any, ...args: any) => void,
	onTimeout?: (transport: any, ...args: any) => void,
	onError?: (transport: any, ...args: any) => void,
	onLoad?: (transport: any, ...args: any) => void,
	onLoadStart?: (transport: any, ...args: any) => void,
	onLoadEnd?: (transport: any, ...args: any) => void,
	onProgress?: (transport: any, ...args: any) => void,
	upload?: (transport: any, ...args: any) => void
};

/**
 * Creates a new request for the specified URL and returns a promise
 *
 * @param url
 * @param params - additional parameters
 */
export function request(url: string, params?: $$requestParams): Promise<XMLHttpRequest> {
	let
		res,
		replacedBy;

	const promise = new Promise((resolve, reject) => {
		res = new Request(url, {
			...params,

			onAbort() {
				if (replacedBy) {
					resolve(replacedBy);

				} else {
					params.onAbort && params.onAbort.apply(this, arguments);
					reject(new RequestError('abort', arguments));
				}
			},

			onError() {
				params.onError && params.onError.apply(this, arguments);
				reject(new RequestError('error', arguments));
			},

			onLoad(transport) {
				const
					st = params.status || /^2\d\d$/;

				let valid;
				if (Object.isRegExp(st)) {
					valid = st.test(String(transport.status));

				} else if (Object.isNumber(st)) {
					valid = st === transport.status;

				} else {
					valid = $C(st).group((el) => el)[transport.status];
				}

				if (valid) {
					params.onLoad && params.onLoad.apply(this, arguments);
					resolve(transport);

				} else {
					params.onError && params.onError.apply(this, arguments);
					reject(new RequestError('invalidStatus', arguments));
				}
			},

			onTimeout() {
				params.onTimeout && params.onTimeout.apply(this, arguments);
				reject(new RequestError('timeout', arguments));
			}
		});

		return res.transport;
	});

	promise.abort = function (id) {
		replacedBy = id;

		const
			{transport, req} = res;

		if (transport.readyState === 4) {
			return;
		}

		if (!req || req.i === 1) {
			if (!transport.aborted) {
				promise.aborted = transport.aborted = true;
				transport.readyState > 1 && transport.abort();
				transport.clearCache();
			}

		} else {
			req.i--;
			$C(cache[res.id]).forEach((fn, key: string) => {
				if (key === 'onAbort') {
					fn(transport);

				} else {
					req.cbs[key].queue.delete(fn);
				}
			});
		}
	};

	return promise;
}

/**
 * Creates new CREATE request for the specified URL and returns a promise
 *
 * @param url
 * @param body
 * @param params
 */
export function c(url: string, body?: any, params?: $$requestParams): Promise<XMLHttpRequest> {
	return request(url, {...params, ...{body, method: 'POST'}});
}

/** @alias c */
export const post = c;

/**
 * Creates new READ request for the specified URL and returns a promise
 *
 * @param url
 * @param body
 * @param params
 */
export function r(url: string, body?: any, params?: $$requestParams): Promise<XMLHttpRequest> {
	return request(url, {...params, ...{body, method: 'GET'}});
}

/** @alias r */
export const get = r;

/**
 * Creates new UPDATE request for the specified URL and returns a promise
 *
 * @param url
 * @param body
 * @param params
 */
export function u(url: string, body?: any, params?: $$requestParams): Promise<XMLHttpRequest> {
	return request(url, {...params, ...{body, method: 'PUT'}});
}

/** @alias u */
export const upd = u;

/**
 * Creates new DELETE request for the specified URL and returns a promise
 *
 * @param url
 * @param body
 * @param params
 */
export function d(url: string, body?: any, params?: $$requestParams): Promise<XMLHttpRequest> {
	return request(url, {...params, ...{body, method: 'DELETE'}});
}

/** @alias d */
export const del = d;

class Request {
	constructor(
		url: string,

		/* eslint-disable no-unused-vars */

		{
			method = 'GET',
			timeout = (25).seconds(),
			defer = 0,
			contentType,
			responseType = 'json',
			headers,
			body = '',
			withCredentials,
			user,
			password,
			onAbort,
			onTimeout,
			onError,
			onLoad,
			onLoadStart,
			onLoadEnd,
			onProgress,
			upload
		}: $$requestParams

		/* eslint-enable no-unused-vars */

	) {
		if (!new URI(url).protocol()) {
			url = joinUri(API, url);
		}

		let data = body;
		if (data) {
			if (Object.isString(data)) {
				data = {data};

			} else if (Object.isObject(body) || Object.isArray(body)) {
				data = Object.fastClone(data);
			}
		}

		const
			id = uuid(),
			urlEncodeRequest = {GET: 1, HEAD: 1}[method];

		if (urlEncodeRequest) {
			body = Object.toQueryString(data);
			contentType = 'text/plain;charset=UTF-8';

		} else if (data instanceof FormData) {
			contentType = '';

		} else if (typeof data === 'object') {
			body = JSON.stringify(data);
			contentType = 'application/json;charset=UTF-8';
		}

		let
			reqKey = null,
			req;

		if (urlEncodeRequest) {
			reqKey = JSON.stringify([
				url,
				method,
				responseType,
				headers,
				body,
				withCredentials,
				user,
				password
			]);

			req = requests[reqKey] = requests[reqKey] || {
				cbs: {},
				i: 0,
				transport: null
			};
		}

		function wrap(fn, key) {
			const hMap = {
				onAbort: true,
				onLoadEnd: true
			};

			if (!req) {
				return function () {
					if (transport.aborted && !hMap[key]) {
						return;
					}

					fn.call(this, transport, ...arguments);
				};
			}

			let cb = req.cbs[key];
			cache[id] = cache[id] || {};
			cache[id][key] = fn;

			if (cb) {
				cb.queue.set(fn, key);

			} else {
				cb = req.cbs[key] = {
					fn() {
						if (transport.aborted && !hMap[key]) {
							return;
						}

						$C(cb.queue).forEach((key, fn: Function) => fn.call(this, transport, ...arguments));
					},

					queue: new Map()
				};

				cb.queue.set(fn, key);
			}

			return cb.fn;
		}

		const
			newRequest = Boolean(!req || !req.transport),
			transport = req && req.transport ? req.transport : new XMLHttpRequest(),
			res = {id, req, transport};

		if (req) {
			req.i++;
			req.transport = transport;
		}

		$C(upload).forEach((el, key: string) =>
			transport.upload[key.toLowerCase()] = wrap(el, key));

		$C(arguments[1]).filter((el) => Object.isFunction(el)).forEach(
			(el, key: string) => transport[key.toLowerCase()] = wrap(el, key)
		);

		if (!newRequest) {
			return res;
		}

		let cleared = false;
		transport.clearCache = () => {
			delete cache[id];
			if (reqKey && !cleared) {
				cleared = true;
				delete requests[reqKey];
			}
		};

		const
			isJSON = responseType === 'json';

		let
			clone,
			responseData,
			timer;

		Object.defineProperty(transport, 'responseData', {
			get() {
				if (responseData === undefined || responseData !== transport.responseDataSource) {
					if (transport.responseDataSource === undefined) {
						responseData = transport.responseDataSource = isJSON ? transport.responseText : transport.response;

					} else {
						responseData = transport.responseDataSource;
					}

					timer && cancelIdleCallback(timer);
					clone = undefined;
				}

				if (isJSON) {
					if (!clone && clone !== null) {
						clone = null;
						timer = requestIdleCallback(() => {
							let data = JSON.parse(responseData, convertDate);
							timer = requestIdleCallback(() => {
								data = data.toSource();
								timer = requestIdleCallback(() => clone = new Function(`return ${data}`));
							});
						});
					}

					return clone ? clone() : JSON.parse(responseData, convertDate);
				}

				return responseData;
			}
		});

		transport.requestData = data;
		transport.open(method, url + (urlEncodeRequest && body ? `?${body}` : ''), true, user, password);
		transport.timeout = timeout;
		transport.responseType = isJSON ? '' : responseType;
		transport.withCredentials = withCredentials;

		$C(headers).forEach((el, key: string) =>
			transport.setRequestHeader(key, String(el)));

		if (contentType) {
			transport.setRequestHeader('Content-Type', contentType);
		}

		onLoadEnd = transport.onloadend;
		transport.onloadend = function () {
			transport.clearCache();
			onLoadEnd && onLoadEnd.apply(this, arguments);
		};

		setTimeout(
			() => {
				if (transport.aborted) {
					transport.onabort && transport.onabort(transport);
					transport.onloadend(transport);

				} else {
					transport.send(urlEncodeRequest ? undefined : body);
				}
			},

			defer
		);

		return res;
	}
}
