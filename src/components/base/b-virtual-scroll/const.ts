/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type bVirtualScroll from 'components/base/b-virtual-scroll/b-virtual-scroll';

import type {

	ComponentDataLocalEvents,
	ComponentItemType,
	ComponentLifecycleEvents,
	ComponentObserverLocalEvents,
	ComponentRenderLocalEvents,
	VirtualScrollState,
	RenderGuardRejectionReason

} from 'components/base/b-virtual-scroll/interface';

/**
 * Base group for performing asynchronous operations of the component.
 */
export const bVirtualScrollAsyncGroup = 'b-virtual-scroll';

/**
 * Group for asynchronous operations related to inserting nodes into the DOM tree.
 */
export const bVirtualScrollDomInsertAsyncGroup = `${bVirtualScrollAsyncGroup}:dom-insert`;

/**
 * {@link ComponentDataLocalEvents}
 */
export const componentDataLocalEvents: ComponentDataLocalEvents = <const>{
	dataLoadStart: 'dataLoadStart',
	dataLoadError: 'dataLoadError',
	dataLoadSuccess: 'dataLoadSuccess',
	dataLoadEmpty: 'dataLoadEmpty'
};

/**
 * {@link ComponentLifecycleEvents}
 */
export const componentLocalEvents: ComponentLifecycleEvents = <const>{
	resetState: 'resetState',
	convertDataToDB: 'convertDataToDB',
	lifecycleDone: 'lifecycleDone'
};

/**
 * {@link ComponentRenderLocalEvents}
 */
export const componentRenderLocalEvents: ComponentRenderLocalEvents = <const>{
	renderStart: 'renderStart',
	renderDone: 'renderDone',
	renderEngineStart: 'renderEngineStart',
	renderEngineDone: 'renderEngineDone',
	domInsertStart: 'domInsertStart',
	domInsertDone: 'domInsertDone'
};

/**
 * {@link ComponentObserverLocalEvents}
 */
export const componentObserverLocalEvents: ComponentObserverLocalEvents = <const>{
	elementEnter: 'elementEnter'
};

export const componentEvents = <const>{
	...componentDataLocalEvents,
	...componentRenderLocalEvents,
	...componentLocalEvents,
	...componentObserverLocalEvents
};

/**
 * {@link RenderGuardRejectionReason}
 */
export const renderGuardRejectionReason: RenderGuardRejectionReason = <const>{
	notEnoughData: 'notEnoughData',
	noData: 'noData',
	done: 'done',
	noPermission: 'noPermission'
};

/**
 * {@link ComponentItemType}
 */
export const componentItemType: ComponentItemType = <const>{
	item: 'item',
	separator: 'separator'
};

export const defaultShouldProps = <const>{
	/** {@link bVirtualScroll.shouldStopRequestingData} */
	shouldStopRequestingData: (state: VirtualScrollState, _ctx: bVirtualScroll): boolean => {
		const isLastRequestEmpty = () => state.lastLoadedData.length === 0;
		return isLastRequestEmpty();
	},

	/** {@link bVirtualScroll.shouldPerformDataRequest} */
	shouldPerformDataRequest: (state: VirtualScrollState, _ctx: bVirtualScroll): boolean => {
		const isLastRequestNotEmpty = () => state.lastLoadedData.length > 0;
		return isLastRequestNotEmpty();
	},

	/** {@link bVirtualScroll.shouldPerformDataRender} */
	shouldPerformDataRender: (state: VirtualScrollState, _ctx: bVirtualScroll): boolean =>
		state.isInitialRender || state.remainingItems === 0
};

