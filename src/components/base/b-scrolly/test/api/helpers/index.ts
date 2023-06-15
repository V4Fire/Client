/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { Page } from 'playwright';
import test from 'tests/config/unit/test';

import type { MountedChild, ComponentItem, ComponentState, MountedItem } from 'components/base/b-scrolly/interface';
import { paginationHandler } from 'tests/helpers/providers/pagination';
import { ScrollyComponentObject } from 'components/base/b-scrolly/test/api/component-object';
import { RequestInterceptor } from 'tests/helpers/providers/interceptor';
import { componentEvents, componentObserverLocalEvents } from 'components/base/b-scrolly/const';
import type { DataConveyor, DataItemCtor, MountedItemCtor, StateApi, ScrollyTestHelpers, MountedSeparatorCtor } from 'components/base/b-scrolly/test/api/helpers/interface';

export * from 'components/base/b-scrolly/test/api/component-object';

/**
 * Creates a helper API for convenient testing of the `b-scrolly` component.
 * @param page The page object representing the testing page.
 */
export async function createTestHelpers(page: Page): Promise<ScrollyTestHelpers> {
	const
		component = new ScrollyComponentObject(page),
		initLoadSpy = await component.spyOn('initLoad', {proto: true}),
		provider = new RequestInterceptor(page, /api/),
		state = createStateApi({}, createDataConveyor(
			createIndexedObj,
			createMountedSeparator,
			createMountedItem
		));

	provider.response(paginationHandler);

	return {
		component,
		initLoadSpy,
		provider,
		state
	};
}

/**
 * Creates a data conveyor that accumulates added data and can return it.
 *
 * For example, the `extractStateFromDataConveyor` function can be used to generate the component's data state based on
 * the provided data conveyor.
 *
 * @param itemsCtor The constructor function for data items.
 * @param separatorCtor The constructor function for mounted separators.
 * @param mountedCtor The constructor function for mounted items.
 */
export function createDataConveyor(
	itemsCtor: DataItemCtor,
	separatorCtor: MountedSeparatorCtor,
	mountedCtor: MountedItemCtor
): DataConveyor {
	let
		data = <unknown[]>[],
		items = <MountedItem[]>[],
		childList = <MountedChild[]>[],
		dataChunks = <unknown[][]>[];

	let
		dataI = 0,
		itemsI = 0,
		childI = 0;

	const obj: DataConveyor = {
		addData(count: number) {
			const newData = createChunk(count, itemsCtor, dataI);

			data.push(...newData);
			dataChunks.push(newData);

			dataI = data.length;
			return newData;
		},

		addItems(count: number) {
			const
				newData = createChunk(count, itemsCtor, itemsI),
				itemsData = createFromData(newData, mountedCtor, itemsI);

			items.push(...itemsData);
			childList.push(...itemsData);

			itemsI = itemsData.length;
			childI = childList.length;

			return itemsData;
		},

		addSeparators(count: number) {
			const
				newData = createChunk(count, itemsCtor, childI),
				separatorsData = createFromData(newData, separatorCtor, childI);

			childList.push(...separatorsData);
			childI = childList.length;

			return separatorsData;
		},

		addChild(list: ComponentItem[]) {
			const newChild = <MountedChild[]>list.map((child, i) => {
				const v = {
					childIndex: childI + i,
					node: <any>test.expect.any(String),
					...child
				};

				return v;
			});

			childList.push(...newChild);
			childI = childList.length;

			return childList;
		},

		reset() {
			dataI = 0;
			itemsI = 0;
			childI = 0;
			childList = [];
			items = [];
			data = [];
			dataChunks = [];
		},

		get items() {
			return items;
		},

		get childList() {
			return childList;
		},

		get data() {
			return data;
		},

		get lastLoadedData() {
			return dataChunks[dataChunks.length - 1];
		}
	};

	return obj;
}

/**
 * Creates an API for convenient manipulation of a component's state fork.
 *
 * @param initial The initial partial state of the component.
 * @param dataConveyor The data conveyor used for managing data within the component.
 */
export function createStateApi(
	initial: Partial<ComponentState>,
	dataConveyor: DataConveyor
): StateApi {
	let
		state = createInitialState(initial);

	return {
		compile(override?: Partial<ComponentState>): ComponentState {
			return {
				...state,
				...extractStateFromDataConveyor(dataConveyor),
				...override
			};
		},

		reset(): void {
			state = createInitialState(initial);
			dataConveyor.reset();
		},

		data: dataConveyor
	};
}

/**
 * Creates the "initial" component state and returns it.
 * Since this state is intended for comparison in tests, some fields use `expect.any` since they are not "stable".
 *
 * @param state The partial component state to override the default values.
 */
export function createInitialState(state: Partial<ComponentState>): ComponentState {
	return {
		renderPage: 0,
		loadPage: 0,
		maxViewedItem: Object.cast(test.expect.any(Number)),
		maxViewedChild: Object.cast(test.expect.any(Number)),
		itemsTillEnd: Object.cast(test.expect.any(Number)),
		childTillEnd: Object.cast(test.expect.any(Number)),
		isInitialRender: true,
		isInitialLoading: true,
		isLoadingInProgress: Object.cast(test.expect.any(Boolean)),
		isLastEmpty: false,
		isLifecycleDone: false,
		isRequestsStopped: false,
		lastLoadedData: [],
		data: [],
		items: [],
		childList: [],
		lastLoadedRawData: undefined,
		...state
	};
}

/**
 * Extracts state data from the data conveyor and returns it.
 * @param conveyor The data conveyor to extract state data from.
 */
export function extractStateFromDataConveyor(conveyor: DataConveyor): Pick<ComponentState, 'data' | 'lastLoadedData' | 'lastLoadedRawData' | 'items' | 'childList'> {
	return {
		data: conveyor.data,
		lastLoadedData: conveyor.lastLoadedData,
		lastLoadedRawData: {data: conveyor.lastLoadedData},
		items: conveyor.items,
		childList: conveyor.childList
	};
}

/**
 * Calls `objCtor` on each element of the `data` array and returns a new array with the results.
 *
 * @param data The array of data elements.
 * @param objCtor The constructor function to create new objects from the data elements.
 * @param start The starting index for creating objects (default: 0).
 */
export function createFromData<DATA, ITEM>(
	data: DATA[],
	objCtor: (data: DATA, i: number) => ITEM,
	start: number = 0
): ITEM[] {
	return data.map((item, i) => objCtor(item, start + i));
}

/**
 * Creates a simple object that matches the {@link MountedItem} interface.
 * @param i The index of the mounted item.
 */
export function createMountedItem(i: number): MountedItem {
	return {
		itemIndex: i,
		childIndex: i,
		props: {
			'data-index': i
		},
		key: Object.cast(undefined),
		item: 'section',
		type: 'item',
		node: <any>test.expect.any(String)
	};
}

/**
 * Creates a simple object that matches the {@link MountedChild}` interface.
 * @param i The index of the mounted child.
 */
export function createMountedSeparator(i: number): MountedChild {
	return {
		childIndex: i,
		props: {
			'data-index': i
		},
		key: Object.cast(undefined),
		item: 'section',
		type: 'separator',
		node: <any>test.expect.any(String)
	};
}

/**
 * Creates an array of data with the specified length and uses the `itemCtor` function to build items within the array.
 * The `start` parameter can be used to specify the starting index that will be passed to the `itemCtor` function.
 *
 * @param count The number of items to create.
 * @param itemCtor The constructor function to create items.
 * @param start The starting index (default: 0).
 */
export function createChunk<DATA extends unknown = unknown>(
	count: number,
	itemCtor: (i: number) => DATA,
	start: number = 0
): DATA[] {
	return Array.from(new Array(count), (_, i) => itemCtor(start + i));
}

/**
 * Creates a simple indexed object.
 * @param i The index of the object.
 */
export function createIndexedObj(i: number): {i: number} {
	return {i};
}

/**
 * Filters emitter emit calls and removes unnecessary events.
 * It only keeps component events, excluding observer-like events.
 *
 * @param emitCalls The array of emit calls.
 * @param filterObserverEvents Whether to filter out observer events (default: true).
 */
export function filterEmitterCalls(emitCalls: unknown[][], filterObserverEvents: boolean = true): unknown[][] {
	return emitCalls.filter(([event]) => Object.isString(event) &&
		Boolean(componentEvents[event]) &&
		(filterObserverEvents ? !(event in componentObserverLocalEvents) : true));
}
