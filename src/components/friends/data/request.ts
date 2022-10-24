/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type Provider from 'core/data';

import type {

	RequestQuery,
	RequestBody,
	RequestResponseObject,
	ModelMethod

} from 'core/data';

import { asyncOptionsKeys } from 'core/async';
import type { CreateRequestOptions } from 'components/super/i-data';

import type Data from 'components/friends/data/class';
import { providerMethods } from 'components/friends/data/const';
import type { DefaultRequest } from 'components/friends/data/interface';

/**
 * Returns the full URL of any provider request
 */
export function url(): CanUndef<string>;

/**
 * Sets an optional URL part for any provider request (it is concatenated with the base part of the URL).
 * This method returns a new Data object with the additional context.
 *
 * @param [value]
 *
 * @example
 * ```js
 * this.url('list').get()
 * ```
 */
export function url<T extends Data>(this: T, value: string): T;
export function url(this: Data, value?: string): CanUndef<string> | Data {
	if (value == null) {
		return this.provider.url();
	}

	const ctx = Object.create(this);
	Object.set(ctx, 'provider', this.provider.url(value));
	return patchProviderContext.call(this, ctx);
}

/**
 * Returns the base part of the URL of any provider request
 */
export function base(): CanUndef<string>;

/**
 * Sets the base part of the URL for any provider request.
 * This method returns a new Data object with the additional context.
 *
 * @param [value]
 *
 * @example
 * ```js
 * this.base('list').get()
 * ```
 */
export function base<T extends Data>(this: T, value: string): T;
export function base(this: Data, value?: string): CanUndef<string> | Data {
	if (value == null) {
		return this.provider.base();
	}

	const ctx = Object.create(this);
	Object.set(ctx, 'provider', this.provider.base(value));
	return patchProviderContext.call(this, ctx);
}

/**
 * Requests data from the provider by a query
 *
 * @param [query] - the request query
 * @param [opts] - additional request options
 */
export function get<D = unknown>(
	this: Data,
	query?: RequestQuery,
	opts?: CreateRequestOptions<D>
): Promise<CanUndef<D>> {
	const
		args = arguments.length > 0 ? [query, opts] : getDefaultRequestParams.call(this, 'get');

	if (Object.isArray(args)) {
		return createRequest.call(this, 'get', ...Object.cast<[RequestQuery, CreateRequestOptions<D>]>(args));
	}

	return Promise.resolve(undefined);
}

/**
 * Checks the provider availability by a query
 *
 * @param [query] - the request query
 * @param [opts] - additional request options
 */
export function peek<D = unknown>(
	this: Data,
	query?: RequestQuery,
	opts?: CreateRequestOptions<D>
): Promise<CanUndef<D>> {
	const
		args = arguments.length > 0 ? [query, opts] : getDefaultRequestParams.call(this, 'peek');

		if (Object.isArray(args)) {
		return createRequest.call(this, 'peek', ...Object.cast<[RequestQuery, CreateRequestOptions<D>]>(args));
	}

	return Promise.resolve(undefined);
}

/**
 * Sends data to the provider without any semantic effects
 *
 * @param [body] - the request body
 * @param [opts] - additional request options
 */
export function post<D = unknown>(
	this: Data,
	body?: RequestBody,
	opts?: CreateRequestOptions<D>
): Promise<CanUndef<D>> {
	const
		args = arguments.length > 0 ? [body, opts] : getDefaultRequestParams.call(this, 'post');

		if (Object.isArray(args)) {
		return createRequest.call(this, 'post', ...Object.cast<[RequestBody, CreateRequestOptions<D>]>(args));
	}

	return Promise.resolve(undefined);
}

/**
 * Adds new data to the provider
 *
 * @param [body] - request body
 * @param [opts] - additional request options
 */
export function add<D = unknown>(
	this: Data,
	body?: RequestBody,
	opts?: CreateRequestOptions<D>
): Promise<CanUndef<D>> {
	const
	args = arguments.length > 0 ? [body, opts] : getDefaultRequestParams.call(this, 'add');

	if (Object.isArray(args)) {
	return createRequest.call(this, 'add', ...Object.cast<[RequestBody, CreateRequestOptions<D>]>(args));
}

return Promise.resolve(undefined);
}

/**
 * Updates the provider data by a query
 *
 * @param [body] - the request body
 * @param [opts] - additional request options
 */
export function upd<D = unknown>(
	this: Data,
	body?: RequestBody,
	opts?: CreateRequestOptions<D>
): Promise<CanUndef<D>> {
	const
	args = arguments.length > 0 ? [body, opts] : getDefaultRequestParams.call(this, 'upd');

	if (Object.isArray(args)) {
	return createRequest.call(this, 'upd', ...Object.cast<[RequestBody, CreateRequestOptions<D>]>(args));
}

return Promise.resolve(undefined);
}

/**
 * Deletes the provider data by a query
 *
 * @param [body] - the request body
 * @param [opts] - additional request options
 */
export function del<D = unknown>(
	this: Data,
	body?: RequestBody,
	opts?: CreateRequestOptions<D>
): Promise<CanUndef<D>> {
	const
		args = arguments.length > 0 ? [body, opts] : getDefaultRequestParams.call(this, 'del');

		if (Object.isArray(args)) {
		return createRequest.call(this, 'del', ...Object.cast<[RequestBody, CreateRequestOptions<D>]>(args));
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
	this: Data,
	method: ModelMethod | Provider[ModelMethod],
	body?: RequestQuery | RequestBody,
	opts: CreateRequestOptions<D> = {}
): Promise<CanUndef<D>> {
	const
		{ctx} = this;

	const
		reqParams = Object.reject(opts, asyncOptionsKeys),
		asyncParams = Object.select(opts, asyncOptionsKeys);

	const req = ctx.waitPermissionToRequest().then(() => {
		let
			rawRequest;

		if (Object.isFunction(method)) {
			rawRequest = method(Object.cast(body), reqParams);

		} else {
			rawRequest = this.provider[method](Object.cast(body), reqParams);
		}

		return this.async.request<RequestResponseObject<D>>(rawRequest, asyncParams);
	});

	if (ctx.mods.progress !== 'true') {
		const
			is = (v) => v !== false;

		if (is(opts.showProgress)) {
			void ctx.setMod('progress', true);
		}

		const then = () => {
			if (is(opts.hideProgress)) {
				void this.lfc.execCbAtTheRightTime(() => ctx.setMod('progress', false));
			}
		};

		req.then(then, (err) => {
			this.provider.emitter.emit('error', err, () => createRequest.call(this, method, body, opts));
			then();
		});
	}

	return req.then((res) => res.data).then((data) => data ?? undefined);
}

/**
 * Returns the default query options for the specified data provider method
 * @param method
 */
export function getDefaultRequestParams<T = unknown>(this: Data, method: string): CanUndef<DefaultRequest<T>> {
	const
		{field} = this;

	const
		[customData, customOpts] = Array.concat([], field.get(`request.${method}`));

	const
		p = field.get(`requestParams.${method}`),
		isGet = /^get(:|$)/.test(method);

	let
		res;

	if (Object.isArray(p)) {
		p[1] = p[1] ?? {};
		res = p;

	} else {
		res = [p, {}];
	}

	if (Object.isPlainObject(res[0]) && Object.isPlainObject(customData)) {
		res[0] = Object.mixin({
			onlyNew: true,
			filter: (el) => {
				if (isGet) {
					return el != null;
				}

				return el !== undefined;
			}
		}, undefined, res[0], customData);

	} else {
		res[0] = res[0] != null ? res[0] : customData;
	}

	res[1] = Object.mixin({deep: true}, undefined, res[1], customOpts);

	const
		requestFilter = this.ctx.defaultRequestFilter,
		isEmpty = Object.size(res[0]) === 0;

	const info = {
		isEmpty,
		method,
		params: res[1]
	};

	let
		needSkip = false;

	if (Object.isFunction(requestFilter)) {
		needSkip = !Object.isTruly(requestFilter.call(this, res[0], info));

	} else if (requestFilter === true) {
		needSkip = isEmpty;
	}

	if (needSkip) {
		return;
	}

	return res;
}

/**
 * Modifies the given data context by adding methods for CRUD operations
 * @param ctx
 */
export function patchProviderContext<T extends Data>(this: Data, ctx: T): T {
	providerMethods.forEach((method) => {
		Object.defineProperty(ctx, method, {
			writable: true,
			configurable: true,
			value: this.ctx.instance[method]
		});
	});

	return ctx;
}
