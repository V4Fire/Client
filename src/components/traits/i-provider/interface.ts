/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type Provider from 'core/data';

import type {

	ModelMethod,
	RequestBody,
	RequestQuery,

	ProviderOptions,
	CreateRequestOptions as BaseCreateRequestOptions

} from 'core/data';

import type { AsyncOptions } from 'core/async';

export type DataProvider = Provider | typeof Provider | string;
export type DataProviderOptions = ProviderOptions;

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
