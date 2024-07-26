/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type Provider from 'core/data';
import type { RequestQuery, RequestBody, RequestPromise, ModelMethod } from 'core/data';

import { asyncOptionsKeys } from 'core/async';
import type { CreateRequestOptions } from 'components/traits/i-data-provider/i-data-provider';

import type DataProvider from 'components/friends/data-provider/class';
import type { DefaultRequest } from 'components/friends/data-provider/interface';

/**
 * Returns the full URL of any provider's request
 */
export function url(): CanUndef<string>;

/**
 * Sets an optional URL part for any provider request (which is concatenated with the base part of the URL).
 * This method returns a new DataProvider object with the additional context.
 *
 * @param [value]
 *
 * @example
 * ```js
 * this.url('list').get()
 * ```
 */
export function url<T extends DataProvider>(this: T, value: string): T;
export function url(this: DataProvider, value?: string): CanUndef<string> | DataProvider {
	if (value == null) {
		return this.provider.url();
	}

	const ctx = Object.create(this);
	Object.set(ctx, 'provider', this.provider.url(value));
	return ctx;
}

/**
 * Returns the base part of the URL for any provider request
 */
export function base(): CanUndef<string>;

/**
 * Sets the base part of the URL for any provider request.
 * This method returns a new Data for the additional context.
 *
 * @param [value]
 *
 * @example
 * ```js
 * this.base('list').get()
 * ```
 */
export function base<T extends DataProvider>(this: T, value: string): T;
export function base(this: DataProvider, value?: string): CanUndef<string> | DataProvider {
	if (value == null) {
		return this.provider.base();
	}

	const ctx = Object.create(this);
	Object.set(ctx, 'provider', this.provider.base(value));
	return ctx;
}

/**
 * Requests data from the provider using a query
 *
 * @param [query] - the request query
 * @param [opts] - additional request options
 */
export function get<D = unknown>(
	this: DataProvider,
	query?: RequestQuery,
	opts?: CreateRequestOptions<D>
): Promise<CanUndef<D>> {
	const args = arguments.length > 0 ? [query, opts] : getDefaultRequestParams.call(this, 'get');

	if (Object.isArray(args)) {
		return createRequest.call(this, 'get', ...Object.cast<[RequestQuery, CreateRequestOptions<D>]>(args));
	}

	return Promise.resolve(undefined);
}

/**
 * Checks the provider availability using a query
 *
 * @param [query] - the request query
 * @param [opts] - additional request options
 */
export function peek<D = unknown>(
	this: DataProvider,
	query?: RequestQuery,
	opts?: CreateRequestOptions<D>
): Promise<CanUndef<D>> {
	const args = arguments.length > 0 ? [query, opts] : getDefaultRequestParams.call(this, 'peek');

	if (Object.isArray(args)) {
		return createRequest.call(this, 'peek', ...Object.cast<[RequestQuery, CreateRequestOptions<D>]>(args));
	}

	return Promise.resolve(undefined);
}

/**
 * Sends data to the provider without any semantic effects.
 * This operation typically involves transmitting data to the provider for purposes such as logging,
 * caching, or simple storage, where the data sent does not trigger any processing or change
 * in state within the provider's system.
 *
 * @param [body] - the request body
 * @param [opts] - additional request options
 */
export function post<D = unknown>(
	this: DataProvider,
	body?: RequestBody,
	opts?: CreateRequestOptions<D>
): Promise<CanUndef<D>> {
	const args = arguments.length > 0 ? [body, opts] : getDefaultRequestParams.call(this, 'post');

	if (Object.isArray(args)) {
		return createRequest.call(this, 'post', ...Object.cast<[RequestBody, CreateRequestOptions<D>]>(args));
	}

	return Promise.resolve(undefined);
}

/**
 * Adds new data to the provider
 *
 * @param [body] - the request body
 * @param [opts] - additional request options
 */
export function add<D = unknown>(
	this: DataProvider,
	body?: RequestBody,
	opts?: CreateRequestOptions<D>
): Promise<CanUndef<D>> {
	const args = arguments.length > 0 ? [body, opts] : getDefaultRequestParams.call(this, 'add');

	if (Object.isArray(args)) {
		return createRequest.call(this, 'add', ...Object.cast<[RequestBody, CreateRequestOptions<D>]>(args));
	}

	return Promise.resolve(undefined);
}

/**
 * Updates the provider's data based on a query
 *
 * @param [body] - the request body
 * @param [opts] - additional request options
 */
export function update<D = unknown>(
	this: DataProvider,
	body?: RequestBody,
	opts?: CreateRequestOptions<D>
): Promise<CanUndef<D>> {
	const args = arguments.length > 0 ? [body, opts] : getDefaultRequestParams.call(this, 'update');

	if (Object.isArray(args)) {
		return createRequest.call(this, 'update', ...Object.cast<[RequestBody, CreateRequestOptions<D>]>(args));
	}

	return Promise.resolve(undefined);
}

/**
 * Deletes the provider's data based on a query
 *
 * @param [body] - the request body
 * @param [opts] - additional request options
 */
export function deleteData<D = unknown>(
	this: DataProvider,
	body?: RequestBody,
	opts?: CreateRequestOptions<D>
): Promise<CanUndef<D>> {
	const args = arguments.length > 0 ? [body, opts] : getDefaultRequestParams.call(this, 'delete');

	if (Object.isArray(args)) {
		return createRequest.call(this, 'delete', ...Object.cast<[RequestBody, CreateRequestOptions<D>]>(args));
	}

	return Promise.resolve(undefined);
}

/**
 * Creates a new request to the data provider
 *
 * @param method - the request method
 * @param [body] - the request body
 * @param [opts] - additional options
 */
export function createRequest<D = unknown>(
	this: DataProvider,
	method: ModelMethod | Provider[ModelMethod],
	body?: RequestQuery | RequestBody,
	opts: CreateRequestOptions<D> = {}
): Promise<CanUndef<D>> {
	const {ctx} = this;

	const
		reqParams = Object.reject(opts, asyncOptionsKeys),
		asyncParams = Object.select(opts, asyncOptionsKeys);

	const req = ctx.waitPermissionToRequest().then(() => {
		let rawRequest: RequestPromise<D>;

		if (Object.isFunction(method)) {
			rawRequest = method(Object.cast(body), reqParams);

		} else {
			rawRequest = this.provider[method](Object.cast(body), reqParams);
		}

		return this.async.request(rawRequest, asyncParams);
	});

	if (ctx.mods.progress !== 'true') {
		const is = (v: boolean | undefined) => v !== false;

		if (is(opts.showProgress)) {
			void ctx.setMod('progress', true);
		}

		const then = () => {
			if (is(opts.hideProgress)) {
				return ctx.setMod('progress', false);
			}
		};

		req
			.then(
				(res) => {
					try {
						this.provider.emitter.emit('response', res);
					} catch {}

					return then();
				},

				(err) => {
					try {
						this.provider.emitter.emit('error', err, () => createRequest.call(this, method, body, opts));
					} catch {}

					return then();
				}
			)

			.catch(stderr);
	}

	return req
		// `res.data` returns a promise that may execute slowly, for example, due to the application of decoders.
		// This can lead to a situation where the component is destroyed, but the request is not canceled.
		.then((res) => this.async.request(res.data, asyncParams))
		.then((data) => data ?? undefined);
}

/**
 * Returns the default query options for the specified method of the data provider
 * @param method
 */
export function getDefaultRequestParams<T = unknown>(
	this: DataProvider,
	method: ModelMethod
): CanNull<DefaultRequest<T>> {
	const {ctx} = this;

	const [customData, customOpts] = Object.cast<DefaultRequest<T>>(
		Array.concat([], ctx.request?.[method])
	);

	const
		p = Object.isDictionary(ctx.requestParams) ? ctx.requestParams[method] : undefined,
		isGet = /^get(:|$)/.test(method);

	let requestParams: [Nullable<DefaultRequest<T>[0]>, DefaultRequest<T>[1]];

	if (Object.isArray(p)) {
		p[1] = p[1] ?? {};
		requestParams = Object.cast(p);

	} else {
		requestParams = [Object.cast(p), {}];
	}

	if (Object.isPlainObject(requestParams[0]) && Object.isPlainObject(customData)) {
		requestParams[0] = Object.mixin({
			propsToCopy: 'new',
			filter: (el) => {
				if (isGet) {
					return el != null;
				}

				return el !== undefined;
			}
		}, undefined, requestParams[0], customData);

	} else {
		requestParams[0] ??= customData;
	}

	requestParams[1] = Object.mixin({deep: true}, undefined, requestParams[1], customOpts);

	const defaultRequest: DefaultRequest<T> = [
		requestParams[0],
		requestParams[1]
	];

	const
		requestFilter = this.ctx.defaultRequestFilter,
		isEmpty = Object.size(requestParams[0]) === 0;

	const info = {
		isEmpty,
		method,
		params: requestParams[1]
	};

	let needSkip = false;

	if (Object.isFunction(requestFilter)) {
		needSkip = !Object.isTruly(requestFilter.call(this, requestParams[0], info));

	} else if (requestFilter === true) {
		needSkip = isEmpty;
	}

	if (needSkip) {
		return null;
	}

	return defaultRequest;
}
