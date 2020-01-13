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
	ModelMethods,
	CreateRequestOptions as BaseCreateRequestOptions

} from 'core/data';

//#endif

export interface RequestFilterOptions<T = unknown> {
	isEmpty: boolean;
	method: ModelMethods;
	params: CreateRequestOptions<T>;
}

export interface RequestFilterFn<T = unknown> {
	(data: RequestQuery | RequestBody, opts: RequestFilterOptions<T>): boolean;
}

export type RequestFilter<T = unknown> =
	boolean |
	RequestFilterFn<T>;

export type DefaultRequest<T = unknown> = [RequestQuery | RequestBody, CreateRequestOptions<T>];
export type Request<T = unknown> = RequestQuery | RequestBody | DefaultRequest<T>;
export type RequestParams<T = unknown> = StrictDictionary<Request<T>>;

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
