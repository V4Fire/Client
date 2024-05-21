/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { Page } from 'playwright';

import test from 'tests/config/unit/test';

import { createInitialState as createInitialStateObj } from 'components/base/b-virtual-scroll-new/modules/state/helpers';
import type { MountedChild, ComponentItem, VirtualScrollState, MountedItem } from 'components/base/b-virtual-scroll-new/interface';
import { componentEvents, componentObserverLocalEvents } from 'components/base/b-virtual-scroll-new/const';

import { paginationHandler } from 'tests/network-interceptors/pagination';
import { RequestInterceptor } from 'tests/helpers';

import { VirtualScrollComponentObject } from 'components/base/b-virtual-scroll-new/test/api/component-object';
import type { DataConveyor, DataItemCtor, MountedItemCtor, StateApi, VirtualScrollTestHelpers, MountedSeparatorCtor, IndexedObj } from 'components/base/b-virtual-scroll-new/test/api/helpers/interface';

export * from 'components/base/b-virtual-scroll-new/test/api/component-object';

/**
 * Creates a helper API for convenient testing of the `b-virtual-scroll-new` component
 * @param page - the page object representing the testing page.
 */
export async function createTestHelpers(page: Page): Promise<VirtualScrollTestHelpers> {
	const
		component = new VirtualScrollComponentObject(page),
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
 * @param itemsCtor - the constructor function for data items.
 * @param separatorCtor - the constructor function for mounted separators.
 * @param mountedCtor - the constructor function for mounted items.
 */
export function createDataConveyor<DATA>(
	itemsCtor: DataItemCtor<DATA>,
	separatorCtor: MountedSeparatorCtor<DATA>,
	mountedCtor: MountedItemCtor<DATA>
): DataConveyor {
	let
		data = <unknown[]>[],
		items = <MountedItem[]>[],
		childList = <MountedChild[]>[],
		dataChunks = <unknown[][]>[];

	let
		dataI = 0,
		itemsI = 0,
		childI = 0,
		page = 0,
		total: CanUndef<number> = undefined;

	const obj: DataConveyor = {
		addData(count: number) {
			const newData = createChunk(count, itemsCtor, dataI);

			data.push(...newData);
			dataChunks.push(newData);

			dataI = data.length;
			page++;

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
			let itemsCounter = 0;

			const newChild = <MountedChild[]>list.map((child, i) => {
				const v = {
					childIndex: childI + i,
					node: <any>test.expect.any(String),
					...child
				};

				if (child.type === 'item') {
					Object.assign(v, {
						itemIndex: items.length + itemsCounter
					});

					itemsCounter++;
				}

				return v;
			});

			items.push(...<MountedItem[]>newChild.filter((item) => item.type === 'item'));
			childList.push(...newChild);
			childI = childList.length;
			itemsI = items.length;

			return childList;
		},

		getDataChunk(index: number) {
			return dataChunks[index];
		},

		setTotal(newTotal: number) {
			total = newTotal;
			return total;
		},

		reset() {
			dataI = 0;
			itemsI = 0;
			childI = 0;
			page = 0;
			total = undefined;
			childList = [];
			items = [];
			data = [];
			dataChunks = [];
		},

		get items() {
			return items;
		},

		get total() {
			return total;
		},

		get childList() {
			return childList;
		},

		get data() {
			return data;
		},

		get page() {
			return page;
		},

		get lastLoadedData() {
			return dataChunks[dataChunks.length - 1] ?? [];
		}
	};

	return obj;
}

/**
 * Creates an API for convenient manipulation of a component's state fork.
 *
 * @param initial - the initial partial state of the component.
 * @param dataConveyor - the data conveyor used for managing data within the component.
 */
export function createStateApi(
	initial: Partial<VirtualScrollState>,
	dataConveyor: DataConveyor
): StateApi {
	let
		state = createInitialState(initial),
		settled = {};

	const obj: StateApi = {
		compile(override?: Partial<VirtualScrollState>): VirtualScrollState {
			const compiled = {
				...state,
				...extractStateFromDataConveyor(dataConveyor)
			};

			Object.keys(settled).forEach((key) => {
				compiled[key] = settled[key];
			});

			if (override) {
				Object.keys(override).forEach((key) => {
					compiled[key] = override[key];
				});
			}

			return compiled;
		},

		set(props: Partial<VirtualScrollState>): StateApi {
			Object.keys(props).forEach((key) => {
				settled[key] = props[key];
				state[key] = props[key];
			});

			return obj;
		},

		reset(): void {
			state = createInitialState(initial);
			settled = {};
			dataConveyor.reset();
		},

		data: dataConveyor
	};

	return obj;
}

/**
 * Creates the "initial" component state and returns it.
 * Since this state is intended for comparison in tests, some fields use `expect.any` since they are not "stable".
 *
 * @param state - the partial component state to override the default values.
 */
export function createInitialState(state: Partial<VirtualScrollState>): VirtualScrollState {
	return {
		...createInitialStateObj(),
		maxViewedItem: Object.cast(test.expect.any(Number)),
		maxViewedChild: Object.cast(test.expect.any(Number)),
		remainingItems: Object.cast(test.expect.any(Number)),
		remainingChildren: Object.cast(test.expect.any(Number)),
		isLoadingInProgress: Object.cast(test.expect.any(Boolean)),
		dataOffset: Object.cast(test.expect.any(Number)),
		...state
	};
}

/**
 * Extracts state data from the data conveyor and returns it
 * @param conveyor - the data conveyor to extract state data from.
 */
export function extractStateFromDataConveyor(conveyor: DataConveyor): Pick<VirtualScrollState, 'data' | 'lastLoadedData' | 'lastLoadedRawData' | 'items' | 'childList'> {
	return {
		data: [...conveyor.data],
		lastLoadedData: [...conveyor.lastLoadedData],
		lastLoadedRawData: conveyor.page === 0 ?
			undefined :
			{
				data: [...conveyor.lastLoadedData],
				...(conveyor.total != null ? {total: conveyor.total} : undefined)
			},
		items: [...conveyor.items],
		childList: [...conveyor.childList]
	};
}

/**
 * Calls `objCtor` on each element of the `data` array and returns a new array with the results.
 *
 * @param data - the array of data elements.
 * @param objCtor - the constructor function to create new objects from the data elements.
 * @param start - the starting index for creating objects (default: 0).
 */
export function createFromData<DATA, ITEM>(
	data: DATA[],
	objCtor: (data: DATA, i: number) => ITEM,
	start: number = 0
): ITEM[] {
	return data.map((item, i) => objCtor(item, start + i));
}

/**
 * Creates a simple object that matches the {@link MountedItem} interface
 * @param data - the object with index of the mounted item.
 */
export function createMountedItem(data: IndexedObj): MountedItem {
	return {
		itemIndex: data.i,
		childIndex: data.i,
		props: {
			'data-index': data.i
		},
		key: Object.cast(undefined),
		item: 'section',
		type: 'item',
		node: <any>test.expect.anything(),
		meta: {
			data: test.expect.any(Object)
		}
	};
}

/**
 * Creates a simple object that matches the {@link MountedChild}` interface
 * @param data - the object with index of the mounted child.
 */
export function createMountedSeparator(data: IndexedObj): MountedChild {
	return {
		childIndex: data.i,
		props: {
			'data-index': data.i
		},
		key: Object.cast(undefined),
		item: 'section',
		type: 'separator',
		node: <any>test.expect.anything()
	};
}

/**
 * Creates an array of data with the specified length and uses the `itemCtor` function to build items within the array.
 * The `start` parameter can be used to specify the starting index that will be passed to the `itemCtor` function.
 *
 * @param count - the number of items to create.
 * @param itemCtor - the constructor function to create items.
 * @param [start] - the starting index (default: 0).
 */
export function createChunk<DATA extends unknown = unknown>(
	count: number,
	itemCtor: (i: number) => DATA,
	start: number = 0
): DATA[] {
	return Array.from(new Array(count), (_, i) => itemCtor(start + i));
}

/**
 * Creates a simple indexed object
 * @param i - the index of the object.
 */
export function createIndexedObj(i: number): IndexedObj {
	return {i};
}

/**
 * Filters emitter emit calls and removes unnecessary events.
 * It only keeps component events.
 *
 * @param emitCalls - the array of emit calls.
 * @param [filterObserverEvents] - whether to filter out observer events (default: true).
 * @param [allowedEvents]
 */
export function filterEmitterCalls(
	emitCalls: unknown[][],
	filterObserverEvents: boolean = true,
	allowedEvents: string[] = []
): unknown[][] {
	return emitCalls.filter(([event]) => Object.isString(event) &&
		(Boolean(componentEvents[event]) || allowedEvents.includes(event)) &&
		(filterObserverEvents ? !(event in componentObserverLocalEvents) : true));
}

/**
 * Filters emitter emit results and removes unnecessary events.
 * It only keeps component events.
 *
 * @param results - the array of emit results.
 * @param [filterObserverEvents] - whether to filter out observer events (default: true).
 * @param [allowedEvents]
 */
export function filterEmitterResults<VAL extends [event: string, ...rest: any[]]>(
	results: Array<JestMockResult<VAL>>,
	filterObserverEvents: boolean = true,
	allowedEvents: string[] = []
): VAL[] {
	const filtered = results.filter(({value: [event]}) => Object.isString(event) &&
		(Boolean(componentEvents[event]) || allowedEvents.includes(event)) &&
		(filterObserverEvents ? !(event in componentObserverLocalEvents) : true));

	return filtered.map(({value}) => value);
}
