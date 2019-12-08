/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import {

	Decoders,
	RequestMethods,
	RequestQuery,
	RequestBody,
	ResponseType,
	ResponseTypes,
	CreateRequestOptions,
	MiddlewareParams

} from 'core/request/interface';

export type MockResponseType =
	ResponseType |
	object;

export interface MockCustomResponse {
	status?: number;
	responseType?: ResponseTypes;
	decoders?: Decoders;
}

export interface MockResponseFunction {
	(params: MiddlewareParams, response: MockCustomResponse): CanPromise<MockResponseType>;
}

export type MockResponse =
	CanPromise<MockResponseType> |
	MockResponseFunction;

export interface Mock {
	status?: number;
	query?: RequestQuery;
	body?: RequestBody;
	headers?: Dictionary<CanArray<unknown>>;
	decoders?: boolean;
	response: MockResponse;
}

export type Mocks = CanPromise<
	{[key in RequestMethods]?: Mock[]} |
	{default: {[key in RequestMethods]?: Mock[]}}
>;

export type ModelMethods =
	'peek' |
	'get' |
	'post' |
	'add' |
	'upd' |
	'del';

export type SocketEvent<T = unknown> = (() => Dictionary<T>) | {
	type: string;
	instance: string;
	data: Dictionary<T>;
};

export interface ProviderParams {
	extraProviders?: FunctionalExtraProviders;
	listenAllEvents?: boolean;
	externalRequest?: boolean;
	socket?: boolean;
}

export interface ExtraProvider {
	provider?: string;
	providerParams?: ProviderParams;
	query?: RequestQuery;
	request?: CreateRequestOptions;
	as?: string;
}

export type ExtraProviders = Dictionary<Nullable<ExtraProvider>>;
export type FunctionalExtraProviders = ExtraProviders | (() => CanUndef<ExtraProviders>);
