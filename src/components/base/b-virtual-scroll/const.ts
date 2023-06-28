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
	ComponentRenderStrategy,
	ComponentState,
	ComponentStrategy,
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
 * {@link ComponentRenderStrategy}
 */
export const componentRenderStrategy: ComponentRenderStrategy = <const>{
	default: 'default',
	reuse: 'reuse'
};

/**
 * {@link ComponentStrategy}
 */
export const componentStrategy: ComponentStrategy = {
	intersectionObserver: 'intersectionObserver',
	scroll: 'scroll',
	scrollWithDropNodes: 'scrollWithDropNodes',
	scrollWithRecycleNodes: 'scrollWithRecycleNodes'
};

/**
 * {@link ComponentDataLocalEvents}
 */
export const componentDataLocalEvents: ComponentDataLocalEvents = <const>{
	dataLoadStart: 'dataLoadStart',
	dataLoadError: 'dataLoadError',
	dataLoadSuccess: 'dataLoadSuccess',
	dataEmpty: 'dataEmpty'
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
	elementEnter: 'elementEnter',
	elementOut: 'elementOut'
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
	shouldStopRequestingData: (state: ComponentState, _ctx: bVirtualScroll): boolean => {
		const isLastRequestNotEmpty = () => state.lastLoadedData.length > 0;
		return !isLastRequestNotEmpty();
	},

	/** {@link bVirtualScroll.shouldPerformDataRequest} */
	shouldPerformDataRequest: (state: ComponentState, _ctx: bVirtualScroll): boolean => {
		const isLastRequestNotEmpty = () => state.lastLoadedData.length > 0;
		return isLastRequestNotEmpty();
	},

	/** {@link bVirtualScroll.shouldPerformDataRender} */
	shouldPerformDataRender: (_state: ComponentState, _ctx: bVirtualScroll): boolean => false
};

