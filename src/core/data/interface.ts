/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import {

	RequestMethods,
	RequestQuery,
	RequestBody,
	ResponseType,
	CreateRequestOpts

} from 'core/request/interface';

export interface Mock {
	status?: number;
	query?: RequestQuery;
	body?: RequestBody;
	headers?: Dictionary<CanArray<unknown>>;
	decoders?: boolean;
	response: ResponseType;
}

export type Mocks = Record<
	RequestMethods,
	Mock[]
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
	query?: RequestQuery;
	requestOpts?: CreateRequestOpts;
	providerParams?: ProviderParams;
}

export type ExtraProviders = Dictionary<Nullable<ExtraProvider>>;
export type FunctionalExtraProviders = ExtraProviders | (() => CanUndef<ExtraProviders>);
