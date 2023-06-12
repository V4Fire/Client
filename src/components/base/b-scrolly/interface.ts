/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type bScrolly from 'components/base/b-scrolly/b-scrolly';
import type { componentItemType, componentDataLocalEvents, componentLocalEvents, componentObserverLocalEvents, componentRenderLocalEvents, componentRenderStrategy, canPerformRenderRejectionReason, componentStrategy } from 'components/base/b-scrolly/const';
import type { CreateRequestOptions, RequestQuery } from 'components/super/i-data/i-data';

/**
 * {@link componentRenderStrategy}
 */
export type ComponentRenderStrategyKeys = keyof typeof componentRenderStrategy;
export type ComponentStrategyKeys = keyof typeof componentStrategy;

/**
 * Состояние компонента.
 */
export interface ComponentState<DATA = object> {
	maxViewedItem: CanUndef<number>;
	maxViewedChild: CanUndef<number>;
	itemsTillEnd: CanUndef<number>;
	childTillEnd: CanUndef<number>;
	loadPage: number;
	renderPage: number;
	isLastEmpty: boolean;
	isInitialLoading: boolean;
	isInitialRender: boolean;
	isRequestsStopped: boolean;
	isLoadingInProgress: boolean;
	isLifecycleDone: boolean;
	lastLoadedData: Readonly<DATA[]>;
	data: Readonly<DATA[]>;
	items: Readonly<MountedItem[]>;
	childList: Readonly<AnyMounted[]>;
	lastLoadedRawData: unknown;
}

/**
 * Тип данных которые хранит компонент.
 */
export interface ComponentDb {
	data: unknown[];
	total?: number;
}

/**
 * Функция которая возвращает GET параметры для запроса.
 */
export interface RequestQueryFn {
	(params: ComponentState): Dictionary<Dictionary>;
}

export interface ComponentItemFactory<DATA = unknown> {
	(state: ComponentState<DATA>, ctx: bScrolly): ComponentItem[];
}

export interface ComponentItem {
	type: ComponentItemType;
	item: string;
	props?: Dictionary<unknown>;
	key: string;
	children?: VNodeChildren;
}

export interface AnyMounted extends ComponentItem {
	node: HTMLElement;
	childIndex: number;
}

export interface MountedItem extends AnyMounted {
	itemIndex: number;
}

export type ComponentItemType = keyof typeof componentItemType;

/**
 * Параметры запроса.
 */
export type RequestParams = [RequestQuery, CreateRequestOptions<unknown>];

export type CanPerformRenderRejectionReason = keyof typeof canPerformRenderRejectionReason;

/**
 * Функция для опроса клиента о необходимости выполнить то или иное действие.
 */
export interface ShouldFn<RES = boolean> {
	(params: ComponentState, ctx: bScrolly): RES;
}

export type ComponentLocalEvents =
	keyof typeof componentDataLocalEvents |
	keyof typeof componentLocalEvents |
	keyof typeof componentRenderLocalEvents |
	keyof typeof componentObserverLocalEvents;

export interface CanPerformRenderResult {
	result: boolean;
	reason?: CanPerformRenderRejectionReason;
}

/**
 * Имя события: аргументы события
 */
export interface LocalEventPayloadMap {
	[componentDataLocalEvents.dataLoadSuccess]: [data: object[], isInitialLoading: boolean];
	[componentDataLocalEvents.dataLoadStart]: [isInitialLoading: boolean];
	[componentDataLocalEvents.dataLoadError]: [isInitialLoading: boolean];
	[componentDataLocalEvents.dataEmpty]: [isInitialLoading: boolean];

	[componentLocalEvents.resetState]: [];
	[componentLocalEvents.lifecycleDone]: [];
	[componentLocalEvents.convertDataToDB]: [data: unknown];

	[componentObserverLocalEvents.elementEnter]: [componentItem: AnyMounted];
	[componentObserverLocalEvents.elementOut]: [componentItem: AnyMounted];

	[componentRenderLocalEvents.renderStart]: [];
	[componentRenderLocalEvents.renderDone]: [];
	[componentRenderLocalEvents.renderEngineStart]: [];
	[componentRenderLocalEvents.renderEngineDone]: [];
	[componentRenderLocalEvents.domInsertStart]: [];
	[componentRenderLocalEvents.domInsertDone]: [];
}

export interface ComponentRefs {
	container: HTMLElement;
	loader?: HTMLElement;
	tombstones?: HTMLElement;
	empty?: HTMLElement;
	retry?: HTMLElement;
	done?: HTMLElement;
	renderNext?: HTMLElement;
}

export type LocalEventPayload<T extends keyof LocalEventPayloadMap> = LocalEventPayloadMap[T];
