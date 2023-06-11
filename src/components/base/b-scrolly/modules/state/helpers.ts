/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { ComponentState } from 'components/base/b-scrolly/b-scrolly';

export function createInitialState(): ComponentState {
	return {
			loadPage: 0,

			renderPage: 0,

			itemsTillEnd: undefined,

			childTillEnd: undefined,

			maxViewedItem: undefined,

			maxViewedChild: undefined,

			data: [],

			lastLoadedData: [],

			lastLoadedRawData: undefined,

			isLastEmpty: false,

			isInitialLoading: true,

			/**
			 * Component items that was rendered
			 */
			items: [],

			childList: [],

			/**
			 * `True` if the next rendering process will be initial
			 */
			isInitialRender: true,

			isRequestsStopped: false,

			isRenderingDone: false,

			isLoadingInProgress: false,

			isLifecycleDone: false
	};
}
