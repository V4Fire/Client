/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { CreateRequestOptions, RequestQuery } from 'components/super/i-data/i-data';
import type { ComponentState } from 'components/base/b-virtual-scroll/interface/component';

/**
 * Function that returns the GET parameters for a request.
 */
export interface RequestQueryFn {
	/**
	 * Returns the GET parameters for a request.
	 *
	 * @param params - The component state.
	 */
	(params: ComponentState): Dictionary<Dictionary>;
}

/**
 * Requests parameters.
 */
export type RequestParams = [RequestQuery, CreateRequestOptions<unknown>];
