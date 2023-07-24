/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { MountedChild } from 'components/base/b-virtual-scroll/interface/component';

import {

	componentDataLocalEvents,
	componentLocalEvents,
	componentObserverLocalEvents,
	componentRenderLocalEvents

} from 'components/base/b-virtual-scroll/const';

/**
 * Component data-related events (emitted in `selfEmitter`).
 */
export interface ComponentDataLocalEvents {
	/**
	 * Data loading has started.
	 */
	dataLoadStart: 'dataLoadStart';

	/**
	 * An error occurred while loading data.
	 */
	dataLoadError: 'dataLoadError';

	/**
	 * Data has been successfully loaded.
	 */
	dataLoadSuccess: 'dataLoadSuccess';

	/**
	 * Successful load with no data.
	 */
	dataLoadEmpty: 'dataLoadEmpty';
}

/**
 * Component events.
 */
export interface ComponentLifecycleEvents {
	/**
	 * Reset component state.
	 */
	resetState: 'resetState';

	/**
	 * Trigger data conversion to the `DB`.
	 */
	convertDataToDB: 'convertDataToDB';

	/**
	 * This event is emitted when all component data is rendered and loaded.
	 */
	lifecycleDone: 'lifecycleDone';
}

/**
 * Component rendering events.
 */
export interface ComponentRenderLocalEvents {
	/**
	 * Rendering of items has started.
	 */
	renderStart: 'renderStart';

	/**
	 * Rendering of items has finished.
	 */
	renderDone: 'renderDone';

	/**
	 * Rendering of items has started with the render engine.
	 */
	renderEngineStart: 'renderEngineStart';

	/**
	 * Rendering of items has finished with the render engine.
	 */
	renderEngineDone: 'renderEngineDone';

	/**
	 * DOM node insertion has started.
	 */
	domInsertStart: 'domInsertStart';

	/**
	 * DOM node insertion has finished.
	 */
	domInsertDone: 'domInsertDone';
}

/**
 * Events of the element observer.
 */
export interface ComponentObserverLocalEvents {
	/**
	 * The element has entered the viewport.
	 */
	elementEnter: 'elementEnter';
}

/**
 * Possible component events.
 */
export type ComponentEvents =
	keyof ComponentDataLocalEvents |
	keyof ComponentLifecycleEvents |
	keyof ComponentRenderLocalEvents |
	keyof ComponentObserverLocalEvents;

/**
 * Mapping of event names and their event arguments.
 * [Event Name: Event Arguments]
 */
export interface LocalEventPayloadMap {
	[componentDataLocalEvents.dataLoadSuccess]: [data: object[], isInitialLoading: boolean];
	[componentDataLocalEvents.dataLoadStart]: [isInitialLoading: boolean];
	[componentDataLocalEvents.dataLoadError]: [isInitialLoading: boolean];
	[componentDataLocalEvents.dataLoadEmpty]: [];

	[componentLocalEvents.resetState]: [];
	[componentLocalEvents.lifecycleDone]: [];
	[componentLocalEvents.convertDataToDB]: [data: unknown];

	[componentObserverLocalEvents.elementEnter]: [componentItem: MountedChild];

	[componentRenderLocalEvents.renderStart]: [];
	[componentRenderLocalEvents.renderDone]: [];
	[componentRenderLocalEvents.renderEngineStart]: [];
	[componentRenderLocalEvents.renderEngineDone]: [];
	[componentRenderLocalEvents.domInsertStart]: [];
	[componentRenderLocalEvents.domInsertDone]: [];
}

/**
 * Returns the type of event arguments.
 */
export type LocalEventPayload<T extends keyof LocalEventPayloadMap> = LocalEventPayloadMap[T];
