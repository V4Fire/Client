/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { ComponentState } from 'components/base/b-virtual-scroll/b-virtual-scroll';
import type { PrivateComponentState } from 'components/base/b-virtual-scroll/interface';

/**
 * Creates an initial state object for a component.
 *
 * @returns An object representing the initial state of a component.
 */
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
		items: [],
		childList: [],
		isInitialRender: true,
		isRequestsStopped: false,
		isLoadingInProgress: false,
		isLifecycleDone: false,
		isLastErrored: false
	};
}

/**
 * Creates an initial private state object for a component.
 *
 * @returns An object representing the initial private state of a component.
 */
export function createPrivateInitialState(): PrivateComponentState {
	return {
		renderCursor: 0
	};
}
