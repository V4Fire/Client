/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * @file Test cases of the component lifecycle
 */

import test from 'tests/config/unit/test';

import { createTestHelpers } from 'components/base/b-scrolly/test/api/helpers';
import type bScrolly from 'components/base/b-scrolly/b-scrolly';
import { defaultShouldProps } from 'components/base/b-scrolly/const';
import type { ComponentItem, ShouldPerform } from 'components/base/b-scrolly/b-scrolly';

test.describe('<b-scrolly> state', () => {
	let
		component: Awaited<ReturnType<typeof createTestHelpers>>['component'],
		provider:Awaited<ReturnType<typeof createTestHelpers>>['provider'],
		state: Awaited<ReturnType<typeof createTestHelpers>>['state'];

	test.beforeEach(async ({demoPage, page}) => {
		await demoPage.goto();

		({component, provider, state} = await createTestHelpers(page));
		await provider.start();
	});

	test('Initial state', async () => {
		const
			chunkSize = 12,
			mockFn = await component.mockFn((ctx: bScrolly) => ctx.getComponentState());

		provider.response(200, {data: []}, {delay: (10).seconds()});

		const expectedState = state.compile({
			lastLoadedRawData: undefined,
			itemsTillEnd: undefined,
			childTillEnd: undefined,
			maxViewedItem: undefined,
			maxViewedChild: undefined,
			isRequestsStopped: false,
			isLoadingInProgress: true,
			lastLoadedData: [],
			loadPage: 1
		});

		await component.setProps({
			'@hook:created': mockFn
		});

		await component.withDefaultPaginationProviderProps({chunkSize});
		await component.build();

		await test.expect(mockFn.results).resolves.toEqual([{type: 'return', value: expectedState}]);
	});

	test('State after loading first and second data chunks', async () => {
		const
			chunkSize = 12,
			providerChunkSize = chunkSize / 2;

		const
			shouldStopRequestingData = <ShouldPerform>(defaultShouldProps.shouldStopRequestingData),
			shouldPerformDataRequest = <ShouldPerform>(({isInitialLoading, itemsTillEnd, isLastEmpty}) =>
				isInitialLoading || (itemsTillEnd === 0 && !isLastEmpty)),
			shouldPerformDataRender = <ShouldPerform>(({isInitialRender, itemsTillEnd}) =>
				isInitialRender || itemsTillEnd === 0);

		await test.step('After rendering first data chunk', async () => {
			provider
				.responseOnce(200, {data: state.data.addData(providerChunkSize)})
				.responseOnce(200, {data: state.data.addData(providerChunkSize)});

			state.data.addItems(chunkSize);

			await component.setProps({
				chunkSize,
				shouldStopRequestingData,
				shouldPerformDataRequest,
				shouldPerformDataRender
			});

			await component.withDefaultPaginationProviderProps({chunkSize: providerChunkSize});
			await component.build();
			await component.waitForContainerChildCountEqualsTo(chunkSize);

			const
				currentState = await component.getComponentState();

			test.expect(currentState).toEqual(state.compile({
				isInitialLoading: false,
				isInitialRender: false,
				isRequestsStopped: false,
				isLoadingInProgress: false,
				loadPage: 2,
				renderPage: 1
			}));
		});

		await test.step('After rendering second data chunk', async () => {
			provider
				.responseOnce(200, {data: state.data.addData(providerChunkSize)})
				.responseOnce(200, {data: state.data.addData(providerChunkSize)})
				.response(200, {data: state.data.addData(0)});

			state.data.addItems(chunkSize);

			await component.scrollToBottom();
			await component.waitForContainerChildCountEqualsTo(chunkSize * 2);
			await component.scrollToBottom();
			await component.waitForLifecycleDone();

			const
				currentState = await component.getComponentState();

			test.expect(currentState).toEqual(state.compile({
				isInitialLoading: false,
				isInitialRender: false,
				isRequestsStopped: true,
				isLoadingInProgress: false,
				isLastEmpty: true,
				isLifecycleDone: true,
				loadPage: 5,
				renderPage: 2
			}));
		});
	});

	test.describe('State after rendering via `itemsFactory`', () => {
		test('`itemsFactory` returns items with `item` and `separator` type', async () => {
			const chunkSize = 12;

			const separator: ComponentItem = {
				item: 'b-button',
				key: Object.cast(undefined),
				children: {
					default: 'ima button'
				},
				props: {
					id: 'button'
				},
				type: 'separator'
			};

			const itemsFactory = await component.mockFn((state, ctx, separator) => {
				const
					data = state.lastLoadedData;

				const items = data.map((item) => ({
					item: 'section',
					key: Object.cast(undefined),
					type: 'item',
					props: {
						'data-index': item.i
					}
				}));

				if (data.length > 0) {
					items.push(separator);
				}

				return items;
			}, separator);

			provider
				.responseOnce(200, {data: state.data.addData(chunkSize)})
				.response(200, {data: state.data.addData(0)});

			state.data.addItems(chunkSize);
			state.data.addChild([separator]);

			await component.setProps({
				itemsFactory,
				shouldPerformDataRender: () => true,
				chunkSize
			});

			await component.withDefaultPaginationProviderProps({chunkSize});
			await component.build();
			await component.waitForContainerChildCountEqualsTo(chunkSize + 1);
			await component.waitForLifecycleDone();

			const
				currentState = await component.getComponentState();

			test.expect(currentState).toEqual(state.compile({
				isInitialLoading: false,
				isInitialRender: false,
				isRequestsStopped: true,
				isLoadingInProgress: false,
				isLastEmpty: true,
				isLifecycleDone: true,
				loadPage: 2,
				renderPage: 1
			}));
		});

		test('`itemsFactory` does not returns items with `item` type', async () => {
			const chunkSize = 12;

			const itemsFactory = await component.mockFn((state) => {
				const
					data = state.lastLoadedData;

				const items = data.map((item) => ({
					item: 'section',
					key: Object.cast(undefined),
					type: 'separator',
					props: {
						'data-index': item.i
					}
				}));

				return items;
			});

			provider
				.responseOnce(200, {data: state.data.addData(chunkSize)})
				.response(200, {data: state.data.addData(0)});

			state.data.addSeparators(chunkSize);

			await component.setProps({
				itemsFactory,
				shouldPerformDataRender: () => true,
				chunkSize
			});

			await component.withDefaultPaginationProviderProps({chunkSize});
			await component.build();
			await component.waitForContainerChildCountEqualsTo(chunkSize);
			await component.waitForLifecycleDone();

			const
				currentState = await component.getComponentState();

			test.expect(currentState).toEqual(state.compile({
				isInitialLoading: false,
				isInitialRender: false,
				isRequestsStopped: true,
				isLoadingInProgress: false,
				isLastEmpty: true,
				isLifecycleDone: true,
				maxViewedItem: undefined,
				itemsTillEnd: undefined,
				loadPage: 2,
				renderPage: 1
			}));
		});
	});

	test.skip('Events state', async () => {
		// ...
	});

});
