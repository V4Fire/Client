/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type bScrolly from 'components/base/b-scrolly/b-scrolly';
import type { ComponentDataLocalEvents, ComponentItemType, ComponentLifecycleEvents, ComponentObserverLocalEvents, ComponentRenderLocalEvents, ComponentRenderStrategy, ComponentState, ComponentStrategy } from 'components/base/b-scrolly/interface';

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
 * Component rendering events.
 */
export const componentRenderLocalEvents: ComponentRenderLocalEvents = <const>{
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
export const componentObserverLocalEvents: ComponentObserverLocalEvents = <const>{
	/**
	 * The element has entered the viewport.
	 */
	elementEnter: 'elementEnter',

	/**
	 * The element has exited the viewport.
	 */
	elementOut: 'elementOut'
};

export const componentEvents = <const>{
	...componentDataLocalEvents,
	...componentRenderLocalEvents,
	...componentLocalEvents,
	...componentObserverLocalEvents
};

/**
 * Reasons for rejecting a render operation.
 */
export const canPerformRenderRejectionReason = <const>{
	/**
	 * Insufficient data to perform a render (e.g., `data.length` is 5 and `chunkSize` is 12).
	 */
	notEnoughData: 'notEnoughData',

	/**
	 * No data available to perform a render (e.g., `data.length` is 0).
	 */
	noData: 'noData',

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

/**
 * `should-like` свойства компонента по умолчанию.
 */
export const defaultProps = <const>{
	/** {@link bScrolly.shouldStopRequestingData} */
	shouldStopRequestingData: (state: ComponentState, _ctx: bScrolly): boolean => {
		const isLastRequestNotEmpty = () => state.lastLoadedData.length > 0;
		return !isLastRequestNotEmpty();
	},

	/** {@link bScrolly.shouldPerformRequest} */
	shouldPerformDataRequest: (state: ComponentState, _ctx: bScrolly): boolean => {
		const isLastRequestNotEmpty = () => state.lastLoadedData.length > 0;
		return isLastRequestNotEmpty();
	},

	/** {@link bScrolly.shouldPerformRender} */
	shouldPerformDataRender: (_state: ComponentState, _ctx: bScrolly): boolean => false
};

