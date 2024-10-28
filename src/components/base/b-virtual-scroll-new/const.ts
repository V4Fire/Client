/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type bVirtualScrollNew from 'components/base/b-virtual-scroll-new/b-virtual-scroll-new';

import type { ComponentItemType, VirtualScrollState, ItemsProcessors } from 'components/base/b-virtual-scroll-new/interface';

/**
 * Base group for performing asynchronous operations of the component.
 */
export const bVirtualScrollNewAsyncGroup = 'b-virtual-scroll-new';

/**
 * Group for asynchronous operations related to inserting nodes into the DOM tree.
 */
export const bVirtualScrollNewDomInsertAsyncGroup = `${bVirtualScrollNewAsyncGroup}:dom-insert`;

/**
 * Group for asynchronous operations related to rendering the first chunk.
 */
export const bVirtualScrollNewFirstChunkRenderAsyncGroup = `${bVirtualScrollNewAsyncGroup}:first-chunk-render`;

/**
 * Group for asynchronous operations related to rendering nodes via vdom.render.
 */
export const bVirtualScrollNewVDomRenderGroup = `${bVirtualScrollNewAsyncGroup}:vdom-render`;

/**
 * Component modes.
 */
export const componentModes = <const>{
	/**
	 * In this mode, data is not loaded via a data provider, but instead passed in through the items prop.
	 */
	items: 'items',

	/**
	 * In this mode, data is loaded via a data provider.
	 */
	dataProvider: 'dataProvider'
};

/**
 * Component data-related events (emitted in `selfEmitter`).
 */
export const componentDataLocalEvents = <const>{
	/**
	 * Data loading has started.
	 */
	dataLoadStart: 'dataLoadStart',

	/**
	 * An error occurred while loading data.
	 */
	dataLoadError: 'dataLoadError',

	/**
	 * Data has been successfully loaded.
	 */
	dataLoadSuccess: 'dataLoadSuccess',

	/**
	 * Successful load with no data.
	 */
	dataLoadEmpty: 'dataLoadEmpty'
};

/**
 * Component events.
 */
export const componentLifecycleEvents = <const>{
	/**
	 * Reset component state.
	 */
	resetState: 'resetState',

	/**
	 * Trigger data conversion to the `DB`.
	 */
	convertDataToDB: 'convertDataToDB',

	/**
	 * This event is emitted when all component data is rendered and loaded.
	 */
	lifecycleDone: 'lifecycleDone'
};

/**
 * Component rendering events.
 */
export const componentRenderLocalEvents = <const>{
	/**
	 * Rendering of items has started.
	 */
	renderStart: 'renderStart',

	/**
	 * Rendering of items has finished.
	 */
	renderDone: 'renderDone',

	/**
	 * Rendering of items has started with the render engine.
	 */
	renderEngineStart: 'renderEngineStart',

	/**
	 * Rendering of items has finished with the render engine.
	 */
	renderEngineDone: 'renderEngineDone',

	/**
	 * DOM node insertion has started.
	 */
	domInsertStart: 'domInsertStart',

	/**
	 * DOM node insertion has finished.
	 */
	domInsertDone: 'domInsertDone'
};

/**
 * Events of the element observer.
 */
export const componentObserverLocalEvents = <const>{
	/**
	 * The element has entered the viewport.
	 */
	elementEnter: 'elementEnter'
};

export const componentEvents = <const>{
	...componentDataLocalEvents,
	...componentRenderLocalEvents,
	...componentLifecycleEvents,
	...componentObserverLocalEvents
};

/**
 * Internal component events (emitted in localEmitter)
 */
export const componentLocalEvents = <const>{
	/**
	 * The rendering cycle of components has completed (the path from renderStart to renderDone has been traversed)
	 */
	renderCycleDone: 'renderCycleDone'
};

/**
 * Reasons for rejecting a render operation.
 */
export const renderGuardRejectionReason = <const>{
	/**
	 * Insufficient data to perform a render (e.g., `data.length` is 5 and `chunkSize` is 12).
	 */
	notEnoughData: 'notEnoughData',

	/**
	 * All rendering operations have been completed.
	 */
	done: 'done',

	/**
	 * The client returns `false` in `shouldPerformDataRender`.
	 */
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
	/** {@link bVirtualScrollNew.shouldStopRequestingData} */
	shouldStopRequestingData: (state: VirtualScrollState, _ctx: bVirtualScrollNew): boolean => {
		const isLastRequestEmpty = () => state.lastLoadedData.length === 0;
		return isLastRequestEmpty();
	},

	/** {@link bVirtualScrollNew.shouldPerformDataRender} */
	shouldPerformDataRender: (state: VirtualScrollState, _ctx: bVirtualScrollNew): boolean =>
		state.isInitialRender || state.remainingItems === 0
};

/**
 * {@link bVirtualScrollNew.itemsProcessors}
 */
export const itemsProcessors: ItemsProcessors = {};
