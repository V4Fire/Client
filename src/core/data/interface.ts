/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { RequestQuery, CreateRequestOpts } from 'core/request/interface';

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
	extraProviders?: ExtraProviders;
	listenAllEvents?: boolean;
	externalRequest?: boolean;
	socket?: boolean;
}

export interface ExtraProvider {
	query?: RequestQuery;
	requestOpts?: CreateRequestOpts;
	providerParams: ProviderParams;
}

export type ExtraProviders = Dictionary<Nullable<ExtraProvider>>;
