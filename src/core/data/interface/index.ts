/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:core/data/interface/README.md]]
 * @packageDocumentation
 */

import { EventEmitter2 as EventEmitter } from 'eventemitter2';
import { CreateRequestOptions, RequestQuery, RequestMethod, RequestResponse, RequestBody } from 'core/request';
import { ModelMethod } from 'core/data/interface';
export * from 'core/data/interface/types';

/**
 * Base interface of a data provider
 */
export default interface Provider {
	/**
	 * Name of the provider
	 */
	readonly providerName: string;

	/**
	 * Event emitter for broadcasting provider events
	 */
	readonly emitter: EventEmitter;

	/**
	 * @deprecated
	 * @see [[Provider.prototype.emitter]]
	 */
	readonly event: EventEmitter

	/**
	 * Releases a custom event name for a request and returns it
	 */
	name(): CanUndef<ModelMethod>;

	/**
	 * Sets a custom event name for a request.
	 * It fires after the first request operation, but only once.
	 *
	 * @param [value]
	 */
	name(value: ModelMethod): Provider;

	/**
	 * Releases a custom request method for a request and returns it
	 */
	method(): CanUndef<RequestMethod>;

	/**
	 * Sets a custom request method for a request.
	 * It is used with the first request operation, but only once.
	 *
	 * @param [value]
	 */
	method(value: RequestMethod): Provider;

	/**
	 * Releases full URL for request and returns it:
	 * all temporary and advanced URL parts will be dropped
	 */
	url(): string;

	/**
	 * Sets an advanced URL part for a request.
	 * It is concatenated with a base part of URL, but after the first request it will be dropped.
	 *
	 * @param [value]
	 */
	url(value: string): Provider;

	/**
	 * Sets a temporary base part of URL for a request.
	 * It replaces the original base URL, but only for a one request.
	 *
	 * @param [value]
	 */
	base(value: string): Provider;

	/**
	 * Drops the cache of requests for this provider
	 */
	dropCache(): void;

	/**
	 * Requests the provider for a data by a query.
	 * This method is similar for a GET request.
	 *
	 * @param [query] - request query
	 * @param [opts] - additional request options
	 */
	get<T = unknown>(query?: RequestQuery, opts?: CreateRequestOptions<T>): RequestResponse;

	/**
	 * Checks accessibility of the provider by a query.
	 * This method is similar for a HEAD request.
	 *
	 * @param [query] - request query
	 * @param [opts] - additional request options
	 */
	peek<T = unknown>(query?: RequestQuery, opts?: CreateRequestOptions<T>): RequestResponse;

	/**
	 * Sends custom data to the provider without any logically effect.
	 * This method is similar for a POST request.
	 *
	 * @param [body] - request body
	 * @param [opts] - additional request options
	 */
	post<T = unknown>(body?: RequestBody, opts?: CreateRequestOptions<T>): RequestResponse;

	/**
	 * Add new data to the provider.
	 * This method is similar for a POST request.
	 *
	 * @param [body] - request body
	 * @param [opts] - additional request options
	 * @emits `add<T>(data: () => T)`
	 */
	add<T = unknown>(body?: RequestBody, opts?: CreateRequestOptions<T>): RequestResponse;

	/**
	 * Updates data of the provider by a query.
	 * This method is similar for a PUT request.
	 *
	 * @param [body] - request body
	 * @param [opts] - additional request options
	 * @emits `upd<T>(data: () => T)`
	 */
	upd<T = unknown>(body?: RequestBody, opts?: CreateRequestOptions<T>): RequestResponse ;

	/**
	 * Deletes data of the provider by a query.
	 * This method is similar for a DELETE request.
	 *
	 * @param [body] - request body
	 * @param [opts] - additional request options
	 * @emits `del<T>(data: () => T)`
	 */
	del<T = unknown>(body?: RequestBody, opts?: CreateRequestOptions<T>): RequestResponse;
}
