/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * @file This test file contains scenarios for checking the functionality of calling the last render in the lifecycle.
 */

import test from 'tests/config/unit/test';

import { createTestHelpers, filterEmitterResults } from 'components/base/b-virtual-scroll-new/test/api/helpers';
import type { VirtualScrollTestHelpers } from 'components/base/b-virtual-scroll-new/test/api/helpers/interface';
import type { ComponentItem, VirtualScrollState } from 'components/base/b-virtual-scroll-new/interface';

const j = (...str: string[]) => str.join(', ');

test.describe('<b-virtual-scroll-new>', () => {
	let
		component: VirtualScrollTestHelpers['component'],
		provider: VirtualScrollTestHelpers['provider'],
		state: VirtualScrollTestHelpers['state'];

	const observerInitialStateFields = {
		remainingItems: undefined,
		remainingChildren: undefined,
		maxViewedChild: undefined,
		maxViewedItem: undefined
	};

	const observerLoadedStateFields = {
		maxViewedChild: undefined,
		maxViewedItem: undefined
	};

	test.beforeEach(async ({demoPage, page}) => {
		await demoPage.goto();

		({component, provider, state} = await createTestHelpers(page));
		await provider.start();
	});

	test.describe(j(
		'chunkSize set to 10',
		'provider responds with 10 elements for the first time',
		'next time provider responds with 0 elements',
		'client says that the requests have completed'
	), () => {
		test('should fire render events 2 times with correct state', async () => {
			const
				chunkSize = 10,
				providerChunkSize = 10;

			const states = [
				state.compile(observerInitialStateFields),
				(
					// 1
					state.data.addData(providerChunkSize),
					state.set({loadPage: 1}).compile(observerInitialStateFields)
				),
				(
					// 2
					state.data.addItems(chunkSize),
					state.set({renderPage: 1, isInitialRender: false}).compile(observerLoadedStateFields)
				),
				(
					// 3
					state.compile()
				),
				(
					// 4
					state.data.addData(0),
					state.set({
						loadPage: 2,
						areRequestsStopped: true,
						isLastEmpty: true,
						isInitialLoading: false
					}).compile()
				),
				(
					// 5
					state.set({isLastRender: true}).compile()
				),
				(
					// 6
					state.set({isLifecycleDone: true}).compile()
				)
			];

			provider
				.responseOnce(200, {data: state.data.getDataChunk(0)})
				.responseOnce(200, {data: state.data.getDataChunk(1)});

			await component
				.withDefaultPaginationProviderProps()
				.withProps({
					chunkSize,
					shouldStopRequestingData: (state: VirtualScrollState): boolean => state.lastLoadedData.length === 0,

					'@hook:beforeDataCreate': (ctx) => {
						const original = ctx.emit;

						ctx.emit = jestMock.mock((...args) => {
							original(...args);
							return [args[0], Object.fastClone(ctx.getVirtualScrollState())];
						});
					}
				})
				.build();

			await component.waitForChildCountEqualsTo(chunkSize);
			await component.scrollToBottom();
			await component.waitForLifecycleDone();

			const
				spy = await component.getSpy((ctx) => ctx.emit),
				results = filterEmitterResults(await spy.results, true, ['initLoadStart', 'initLoad']);

			test.expect(results).toEqual([
				['initLoadStart', {...states[0], isLoadingInProgress: true}],
				['dataLoadStart', {...states[0], isLoadingInProgress: true}],
				['convertDataToDB', {...states[0], lastLoadedRawData: states[1].lastLoadedRawData}],
				['initLoad', {...states[0], lastLoadedRawData: states[1].lastLoadedRawData}],
				['dataLoadSuccess', states[1]],
				['renderStart', states[1]],
				['renderEngineStart', states[1]],
				['renderEngineDone', states[1]],
				['domInsertStart', states[2]],
				['domInsertDone', states[2]],
				['renderDone', states[2]],
				['dataLoadStart', {...states[3], isLoadingInProgress: true}],
				['convertDataToDB', {...states[3], lastLoadedRawData: states[4].lastLoadedRawData}],
				['dataLoadSuccess', states[4]],
				['renderStart', states[5]],
				['renderDone', states[5]],
				['lifecycleDone', states[6]]
			]);
		});
	});

	test.describe(j(
		'itemsFactory creates a component for each data element and always adds another separator to this array',
		'the provider returned 10 elements on the first load',
		'in the second load the provider returned 0 elements'
	), () => {
		test('12 elements should be rendered', async () => {
			const
				chunkSize = 10;

			provider
				.responseOnce(200, {data: state.data.addData(chunkSize)})
				.response(200, {data: state.data.addData(0)});

			const separator: ComponentItem = {
				item: 'button',
				key: Object.cast(undefined),
				children: [],
				props: {},
				type: 'separator'
			};

			const itemsFactory = await component.mockFn((state, ctx, separator) => {
				const data = state.lastLoadedData;

				const result: ComponentItem[] = data.map((item) => ({
					item: 'section',
					key: Object.cast(undefined),
					type: 'item',
					children: [],
					props: {
						'data-index': item.i
					}
				}));

				result.push(separator);

				return result;
			}, separator);

			await component
				.withDefaultPaginationProviderProps({chunkSize})
				.withProps({
					itemsFactory,
					shouldPerformDataRender: () => true,
					chunkSize
				})
				.build();

			await component.waitForDataIndexChild(1);
			await component.scrollToBottom();
			await component.waitForLifecycleDone();

			await test.expect(component.container.locator('section')).toHaveCount(10);
			await test.expect(component.container.locator('button')).toHaveCount(2);
			await test.expect(component.childList).toHaveCount(12);
		});
	});
});

