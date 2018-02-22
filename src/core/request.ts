/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import $C = require('collection.js');
import URI = require('urijs');
import joinUri = require('join-uri');
import { convertIfDate } from 'core/json';

const
	requests = Object.createDict(),
	cache = Object.createDict();

export class RequestError {
	/**
	 * Error arguments
	 */
	args: Dictionary;

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
	constructor(type: string, args: Dictionary) {
		this.args = args;
		this.type = type;
		this.code = args[0].status;
	}
}

export interface RequestLike<T> extends PromiseLike<T> {
	aborted?: boolean;
}

export interface RequestParams {
	method?: string;
	timeout?: number;
	defer?: number;
	contentType?: string;
	responseType?: string;
	headers?: Object;
	body?: any;
	withCredentials?: boolean;
	user?: string;
	password?: string;
	status?: RegExp | number | number[];
	// tslint:disable:prefer-method-signature
	onAbort?: (transport: any, ...args: any[]) => void;
	onTimeout?: (transport: any, ...args: any[]) => void;
	onError?: (transport: any, ...args: any[]) => void;
	onLoad?: (transport: any, ...args: any[]) => void;
	onLoadStart?: (transport: any, ...args: any[]) => void;
	onLoadEnd?: (transport: any, ...args: any[]) => void;
	onProgress?: (transport: any, ...args: any[]) => void;
	upload?: (transport: any, ...args: any[]) => void;
	// tslint:enable:prefer-method-signature
}

/**
 * Creates a new request for the specified URL and returns a promise
 *
 * @param url
 * @param params - additional parameters
 */
export default function request(url: string, params?: RequestParams): RequestLike<XMLHttpRequest> {
	const
		p = params || {};

	let
		res,
		replacedBy;

	const promise: any = new Promise((resolve, reject) => {
		res = new Request(url, {
			...params,

			onAbort(): void {
				if (replacedBy) {
					resolve(replacedBy);

				} else {
					p.onAbort && p.onAbort.apply(this, arguments);
					reject(new RequestError('abort', arguments));
				}
			},

			onError(): void {
				p.onError && p.onError.apply(this, arguments);
				reject(new RequestError('error', arguments));
			},

			onLoad(transport: any): void {
				const
					st = p.status || /^2\d\d$/;

				let valid;
				if (Object.isRegExp(st)) {
					valid = st.test(String(transport.status));

				} else if (Object.isNumber(st)) {
					valid = st === transport.status;

				} else {
					valid = $C(st).group((el) => el)[transport.status];
				}

				if (valid) {
					p.onLoad && p.onLoad.apply(this, arguments);
					resolve(transport);

				} else {
					p.onError && p.onError.apply(this, arguments);
					reject(new RequestError('invalidStatus', arguments));
				}
			},

			onTimeout(): void {
				p.onTimeout && p.onTimeout.apply(this, arguments);
				reject(new RequestError('timeout', arguments));
			}
		});

		return res.transport;
	});

	promise.abort = (id) => {
		replacedBy = id;

		const
			DONE_STATE = 4,
			{transport, req} = res;

		if (transport.readyState === DONE_STATE) {
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
export function c(url: string, body?: any, params?: RequestParams): RequestLike<XMLHttpRequest> {
	return request(url, {...params, body, method: 'POST'});
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
export function r(url: string, body?: any, params?: RequestParams): RequestLike<XMLHttpRequest> {
	return request(url, {...params, body, method: 'GET'});
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
export function u(url: string, body?: any, params?: RequestParams): RequestLike<XMLHttpRequest> {
	return request(url, {...params, body, method: 'PUT'});
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
export function d(url: string, body?: any, params?: RequestParams): RequestLike<XMLHttpRequest> {
	return request(url, {...params, body, method: 'DELETE'});
}

/** @alias d */
export const del = d;

class Request {
	constructor(url: string, p: RequestParams) {
		p = Object.assign({
			method: 'GET',
			// tslint:disable-next-line
			timeout: (25).seconds(),
			defer: 0,
			responseType: 'json',
			body: ''
		}, p);

		if (!new URI(url).protocol()) {
			url = joinUri(API, url);
		}

		let data = p.body;
		if (data) {
			if (Object.isString(data)) {
				data = {data};

			} else if (Object.isObject(p.body) || Object.isArray(p.body)) {
				data = Object.fastClone(data);
			}
		}

		const
			id = Math.random(),
			urlEncodeRequest = {GET: 1, HEAD: 1}[<string>p.method];

		if (urlEncodeRequest) {
			p.body = Object.toQueryString(data);
			p.contentType = 'text/plain;charset=UTF-8';

		} else if (data instanceof FormData) {
			p.contentType = '';

		} else if (typeof data === 'object') {
			p.body = JSON.stringify(data);
			p.contentType = 'application/json;charset=UTF-8';
		}

		let
			reqKey: string | null = null,
			req;

		if (urlEncodeRequest) {
			reqKey = JSON.stringify([
				url,
				p.method,
				p.responseType,
				p.headers,
				p.body,
				p.withCredentials,
				p.user,
				p.password
			]);

			req = requests[reqKey] = requests[reqKey] || {
				cbs: {},
				i: 0,
				transport: null
			};
		}

		function wrap(fn: Function, key: string): Function {
			const hMap = {
				onAbort: true,
				onLoadEnd: true
			};

			if (!req) {
				return function (): void {
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
					fn(): void {
						if (transport.aborted && !hMap[key]) {
							return;
						}

						const args = arguments;
						$C(cb.queue).forEach((fn) => fn.call(this, transport, ...args));
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

		$C(p.upload).forEach((el, key: string) =>
			transport.upload[key.toLowerCase()] = wrap(el, key));

		$C(p).filter((el) => Object.isFunction(el)).forEach(
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
			isJSON = p.responseType === 'json';

		let
			clone,
			responseData,
			timer;

		Object.defineProperty(transport, 'responseData', {
			get(): any {
				if (responseData === undefined || responseData !== transport.responseDataSource) {
					// tslint:disable-next-line
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
							let data = JSON.parse(responseData, convertIfDate);
							timer = requestIdleCallback(() => {
								data = data.toSource();
								timer = requestIdleCallback(() => clone = new Function(`return ${data}`));
							});
						});
					}

					return clone ? clone() : JSON.parse(responseData, convertIfDate);
				}

				return responseData;
			}
		});

		transport.requestData = data;
		transport.open(p.method, url + (urlEncodeRequest && p.body ? `?${p.body}` : ''), true, p.user, p.password);
		transport.timeout = p.timeout;
		transport.responseType = isJSON ? '' : p.responseType;
		transport.withCredentials = p.withCredentials;

		$C(p.headers).forEach((el, key: string) =>
			transport.setRequestHeader(key, String(el)));

		if (p.contentType) {
			transport.setRequestHeader('Content-Type', p.contentType);
		}

		p.onLoadEnd = transport.onloadend;
		transport.onloadend = function (): void {
			transport.clearCache();
			p.onLoadEnd && p.onLoadEnd.apply(this, arguments);
		};

		setTimeout(
			() => {
				if (transport.aborted) {
					transport.onabort && transport.onabort(transport);
					transport.onloadend(transport);

				} else {
					transport.send(urlEncodeRequest ? undefined : p.body);
				}
			},

			p.defer
		);

		return res;
	}
}
