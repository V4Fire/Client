/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type Provider from 'core/data';

import type {

	RequestBody,
	RequestQuery,

	ProviderOptions,
	CreateRequestOptions

} from 'core/data';

export type DataProviderProp = string | Provider | typeof Provider | (() => Provider | typeof Provider);
export type DataProviderOptions = ProviderOptions;

export type DefaultRequest<D = unknown> = [
	RequestQuery | RequestBody,
	CreateRequestOptions<D>
];
