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

export * from 'components/base/b-scrolly/test/api/component-object';

type DataItemCtor<DATA = any> = (i: number) => DATA;
type MountedItemCtor<DATA = any> = (data: DATA, i: number) => MountedComponentItem;

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
	addData(count: number): this;
	addMounted(count: number): this;
	get data(): DATA[];
	get mounted(): MountedComponentItem[];
}

export function createDataConveyor<DATA = any>(
	itemsCtor: DataItemCtor<DATA>,
	mountedCtor: MountedItemCtor<DATA>
): DataConveyor {
	const
		data = <DATA[]>[],
		mounted = <MountedComponentItem[]>[];

	let
		dataI = 0,
		mountedI = 0;

	const obj: DataConveyor = {
		addData(count: number) {
			const
				newData = createData(count, itemsCtor, dataI);

			data.push(...newData);

			dataI = data.length;
			return this;
		},

		addMounted(count: number) {
			const
				newData = createData(count, itemsCtor, mountedI),
				mountedData = createMountedDataFrom(newData, mountedCtor, mountedI);

			mounted.push(...mountedData);

			mountedI = mountedData.length;
			return this;
		},

		get mounted() {
			return mounted;
		},

		get data() {
			return data;
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
		item: 'section',
		type: 'item',
		key: Object.cast(undefined),
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
	const state = fromInitialState(initial);

	return {
		compile() {
			return {
				...state,
				...stateFromDataConveyor(dataConveyor)
			};
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
		isLastEmpty: false,
		...state
	};
}

export function stateFromDataConveyor(conveyor: DataConveyor): Pick<ComponentState, 'data' | 'lastLoaded' | 'lastLoadedRawData' | 'mountedItems'> {
	return {
		data: conveyor.data,
		lastLoaded: conveyor.data,
		lastLoadedRawData: {data: conveyor.data},
		mountedItems: conveyor.mounted
	};
}
