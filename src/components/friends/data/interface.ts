/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { RequestQuery, RequestBody, CreateRequestOptions } from 'core/data';

export type DefaultRequest<D = unknown> = [RequestQuery | RequestBody, CreateRequestOptions<D>];
