/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { CreateRequestOptions, RequestQuery } from 'components/super/i-data/i-data';
import type { VirtualScrollState } from 'components/base/b-virtual-scroll-new/interface/component';

/**
 * Function that returns the GET parameters for a request.
 */
export interface RequestQueryFn {
	/**
	 * Returns the GET parameters for a request.
	 *
	 * @param state - the component state.
	 */
	(state: VirtualScrollState): Dictionary<Dictionary>;
}

/**
 * Requests parameters.
 */
export type VirtualScrollRequestParams = [RequestQuery, CreateRequestOptions<unknown>];
