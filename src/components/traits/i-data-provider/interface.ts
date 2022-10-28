/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type {

	ModelMethod,

	RequestBody,
	RequestQuery,

	CreateRequestOptions as BaseCreateRequestOptions

} from 'core/data';

import type { AsyncOptions } from 'core/async';
import type { DefaultRequest } from 'components/friends/data-provider';

export type RequestParams<D = unknown> = Partial<Record<ModelMethod, Request<D>>>;

export type Request<D = unknown> =
	RequestQuery |
	RequestBody |
	DefaultRequest<D>;

export interface CreateRequestOptions<T = unknown> extends BaseCreateRequestOptions<T>, AsyncOptions {
	showProgress?: boolean;
	hideProgress?: boolean;
}
