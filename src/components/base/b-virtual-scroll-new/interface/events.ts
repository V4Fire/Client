/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { MountedChild } from 'components/base/b-virtual-scroll-new/interface/component';

import {

	componentDataLocalEvents,
	componentLifecycleEvents,
	componentObserverLocalEvents,
	componentRenderLocalEvents

} from 'components/base/b-virtual-scroll-new/const';

/**
 * {@link componentDataLocalEvents}
 */
export type ComponentDataLocalEvents = typeof componentDataLocalEvents;

/**
 * {@link componentLifecycleEvents}
 */
export type ComponentLifecycleEvents = typeof componentLifecycleEvents;

/**
 * {@link componentRenderLocalEvents}
 */
export type ComponentRenderLocalEvents = typeof componentRenderLocalEvents;

/**
 * {@link componentObserverLocalEvents}
 */
export type ComponentObserverLocalEvents = typeof componentObserverLocalEvents;

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

	[componentLifecycleEvents.resetState]: [];
	[componentLifecycleEvents.lifecycleDone]: [];
	[componentLifecycleEvents.convertDataToDB]: [data: unknown];

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
