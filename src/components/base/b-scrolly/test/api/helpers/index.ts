/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { Page } from 'playwright';
import test from 'tests/config/unit/test';

import type { ComponentState, MountedComponentItem } from 'components/base/b-scrolly/interface';
import { paginationHandler } from 'tests/helpers/providers/pagination';
import { ScrollyComponentObject } from 'components/base/b-scrolly/test/api/component-object';
import { RequestInterceptor } from 'tests/helpers/providers/interceptor';
import { componentEvents } from 'components/base/b-scrolly/const';

export * from 'components/base/b-scrolly/test/api/component-object';

type DataItemCtor<DATA = any> = (i: number) => DATA;
type MountedItemCtor<DATA = any> = (data: DATA, i: number) => MountedComponentItem;

export function filterEmitterCalls(calls: unknown[][]): unknown[][] {
	return calls.filter(([event]) => Object.isString(event) && Boolean(componentEvents[event]));
}

/**
 * Creates a test helpers for `b-scrolly` component
 * @param page
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export async function createTestHelpers(page: Page) {
	const
		component = new ScrollyComponentObject(page),
		initLoadSpy = await component.spyOn('initLoad', {proto: true}),
		provider = new RequestInterceptor(page, /api/),
		state = createState({}, createDataConveyor(
			indexDataCtor,
			sectionMountedItemCtor
		));

	provider.response(paginationHandler);

	return {
		component,
		initLoadSpy,
		provider,
		state
	};
}

export interface DataConveyor<DATA = any> {
	addData(count: number): DATA[];
	addMounted(count: number): MountedComponentItem[];
	getDataChunk(index: number): DATA[];
	reset(): void;
	get data(): DATA[];
	get lastLoadedData(): DATA[];
	get mounted(): MountedComponentItem[];
}

export function createDataConveyor<DATA = any>(
	itemsCtor: DataItemCtor<DATA>,
	mountedCtor: MountedItemCtor<DATA>
): DataConveyor {
	let
		data = <DATA[]>[],
		mounted = <MountedComponentItem[]>[],
		dataChunks = <DATA[][]>[];

	let
		dataI = 0,
		mountedI = 0;

	const obj: DataConveyor = {
		addData(count: number) {
			const
				newData = createData(count, itemsCtor, dataI);

			data.push(...newData);
			dataChunks.push(newData);

			dataI = data.length;
			return newData;
		},

		addMounted(count: number) {
			const
				newData = createData(count, itemsCtor, mountedI),
				mountedData = createMountedDataFrom(newData, mountedCtor, mountedI);

			mounted.push(...mountedData);

			mountedI = mountedData.length;
			return mountedData;
		},

		reset() {
			dataI = 0;
			mountedI = 0;
			mounted = [];
			data = [];
			dataChunks = [];
		},

		getDataChunk(i: number) {
			return dataChunks[i];
		},

		get mounted() {
			return mounted;
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

export function createMountedDataFrom<DATA = any>(
	data: DATA[],
	ctor: MountedItemCtor<DATA>,
	start: number = 0
): MountedComponentItem[] {
	return data.map((item, i) => ctor(item, start + i));
}

export function sectionMountedItemCtor<DATA = any>(data: DATA, i: number): MountedComponentItem {
	return {
		index: i,
		props: {
			'data-index': i
		},
		key: Object.cast(undefined),
		item: 'section',
		type: 'item',
		node: <any>test.expect.any(String)
	};
}

export function indexDataCtor(i: number): {i: number} {
	return {i};
}

/**
 * TODO: Docs
 * @param count
 * @param start
 * @param itemCtor
 */
export function createData<DATA extends unknown = unknown>(
	count: number,
	itemCtor: (i: number) => DATA,
	start: number = 0
): DATA[] {
	return Array.from(new Array(count), (_, i) => itemCtor(start + i));
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function createState(
	initial: Partial<ComponentState>,
	dataConveyor: DataConveyor
) {
	let
		state = fromInitialState(initial);

	return {
		setLoadPage(val: number) {
			state.loadPage = val;
		},

		compile(override?: Partial<ComponentState>): ComponentState {
			return {
				...state,
				...stateFromDataConveyor(dataConveyor),
				...override
			};
		},

		reset() {
			state = fromInitialState(initial);
			dataConveyor.reset();
		},

		data: dataConveyor
	};
}

export function fromInitialState(state: Partial<ComponentState>): ComponentState {
	return <ComponentState>{
		renderPage: 0,
		loadPage: 0,
		maxViewedIndex: test.expect.any(Number),
		itemsTillEnd: test.expect.any(Number),
		isInitialRender: true,
		isInitialLoading: true,
		isLoadingInProgress: test.expect.any(Boolean),
		isLastEmpty: false,
		isLifecycleDone: false,
		...state
	};
}

export function stateFromDataConveyor(conveyor: DataConveyor): Pick<ComponentState, 'data' | 'lastLoadedData' | 'lastLoadedRawData' | 'mountedItems'> {
	return {
		data: conveyor.data,
		lastLoadedData: conveyor.lastLoadedData,
		lastLoadedRawData: {data: conveyor.lastLoadedData},
		mountedItems: conveyor.mounted
	};
}
