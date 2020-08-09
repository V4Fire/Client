/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

//#if runtime has core/data

import {

	RequestQuery,
	RequestBody,
	ModelMethod,
	CreateRequestOptions as BaseCreateRequestOptions

} from 'core/data';

//#endif

import { AsyncOptions } from 'core/async';
import { UnsafeIBlock } from 'super/i-block/i-block';

import iData from 'super/i-data/i-data';

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
export type RequestParams<D = unknown> = Partial<Record<ModelMethod, Request<D>>>;

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

// @ts-ignore (extend)
export interface UnsafeIData<CTX extends iData = iData> extends UnsafeIBlock<CTX> {
	// @ts-ignore (access)
	dataProviderEmitter: CTX['dataProviderEmitter'];

	// @ts-ignore (access)
	requestParams: CTX['requestParams'];

	// @ts-ignore (access)
	dbStore: CTX['dbStore'];

	// @ts-ignore (access)
	dp: CTX['dp'];

	// @ts-ignore (access)
	saveDataToRootStore: CTX['saveDataToRootStore'];

	// @ts-ignore (access)
	convertDataToDB: CTX['convertDataToDB'];

	// @ts-ignore (access)
	convertDBToComponent: CTX['convertDBToComponent'];

	// @ts-ignore (access)
	initRemoteData: CTX['initRemoteData'];

	// @ts-ignore (access)
	syncRequestParamsWatcher: CTX['syncRequestParamsWatcher'];

	// @ts-ignore (access)
	syncDataProviderWatcher: CTX['syncDataProviderWatcher'];

	// @ts-ignore (access)
	getDefaultRequestParams: CTX['getDefaultRequestParams'];

	// @ts-ignore (access)
	createRequest: CTX['createRequest'];
}
