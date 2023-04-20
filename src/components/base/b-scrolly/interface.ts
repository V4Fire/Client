/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type bScrolly from 'components/base/b-scrolly/b-scrolly';
import type { componentItemType, componentDataLocalEvents, componentLocalEvents, componentObserverLocalEvents, componentRenderLocalEvents, componentRenderStrategy, canPerformRenderRejectionReason } from 'components/base/b-scrolly/const';
import type { CreateRequestOptions, RequestQuery } from 'components/super/i-data/i-data';

/**
 * {@link componentRenderStrategy}
 */
export type ComponentRenderStrategyKeys = keyof typeof componentRenderStrategy;

/**
 * Состояние компонента.
 */
export interface ComponentState {
	loadPage: number;
	renderPage: number;
	data: object[];
	isLastEmpty: boolean;
	isInitialLoading: boolean;
	lastLoaded: object[];
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

export interface ComponentItemFactory {
	(ctx: bScrolly, items: unknown[]): ComponentItem[];
}

export interface ComponentItem {
	type: ComponentItemType;
	item: string;
	props?: Dictionary<unknown>;
	key: string;
	children?: ComponentItem[];
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
export interface ShouldRequestFn {
	(params: ComponentState, ctx: bScrolly): boolean;
}

export type ComponentLocalEvents =
	keyof typeof componentDataLocalEvents |
	keyof typeof componentLocalEvents |
	keyof typeof componentRenderLocalEvents |
	keyof typeof componentObserverLocalEvents;

/**
 * Имя события: аргументы события
 */
export interface LocalEventPayloadMap {
	dataLoadSuccess: [data: object[], isInitialLoading: boolean];
	dataLoadFinish: [isInitialLoading: boolean];
	dataLoadStart: [isInitialLoading: boolean];
	dataLoadError: [isInitialLoading: boolean];
	dataEmpty: [isInitialLoading: boolean];

	resetState: [];
	convertDataToDB: [data: unknown];

	elementEnter: [element: HTMLElement, index: number, data: unknown];
	elementOut: [element: HTMLElement, index: number, data: unknown];

	renderStart: [];
	renderDone: [];
	renderEngineStart: [];
	renderEngineDone: [];
	domInsertStart: [];
	domInsertDone: [];
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
