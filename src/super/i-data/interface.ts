/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { AsyncOptions } from 'core/async';

//#if runtime has core/data

import {

	RequestQuery,
	RequestBody,
	ModelMethod,
	CreateRequestOptions as BaseCreateRequestOptions

} from 'core/data';

//#endif

export interface RequestFilterOptions<D = unknown> {
	isEmpty: boolean;
	method: ModelMethod;
	params: CreateRequestOptions<D>;
}

export interface RequestFilterFn<D = unknown> {
	(data: RequestQuery | RequestBody, opts: RequestFilterOptions<D>): boolean;
}

export type RequestFilter<D = unknown> =
	boolean |
	RequestFilterFn<D>;

export type DefaultRequest<D = unknown> = [RequestQuery | RequestBody, CreateRequestOptions<D>];
export type RequestParams<D = unknown> = StrictDictionary<Request<D>>;

export type Request<D = unknown> =
	RequestQuery |
	RequestBody |
	DefaultRequest<D>;

export interface CreateRequestOptions<T = unknown> extends BaseCreateRequestOptions<T>, AsyncOptions {
	showProgress?: boolean;
	hideProgress?: boolean;
}

export interface RetryRequestFn<T = unknown> {
	(): Promise<CanUndef<T>>;
}

export interface ComponentConverter<T = unknown> {
	(value: unknown): T;
}

export interface CheckDBEqualityFn<T = unknown> {
	(value: CanUndef<T>, oldValue: CanUndef<T>): boolean;
}

export type CheckDBEquality<T = unknown> =
	boolean |
	CheckDBEqualityFn<T>;
