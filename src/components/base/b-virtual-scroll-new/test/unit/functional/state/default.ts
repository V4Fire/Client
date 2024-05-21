/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * @file This file contains test cases that verify the correctness of the internal component state module.
 */

import test from 'tests/config/unit/test';

import type bVirtualScrollNew from 'components/base/b-virtual-scroll-new/b-virtual-scroll-new';
import { defaultShouldProps } from 'components/base/b-virtual-scroll-new/const';
import type { ComponentItem, ShouldPerform } from 'components/base/b-virtual-scroll-new/interface';

import { createTestHelpers } from 'components/base/b-virtual-scroll-new/test/api/helpers';
import type { VirtualScrollTestHelpers } from 'components/base/b-virtual-scroll-new/test/api/helpers/interface';

test.describe('<b-virtual-scroll-new>', () => {
	let
		component: VirtualScrollTestHelpers['component'],
		provider: VirtualScrollTestHelpers['provider'],
		state: VirtualScrollTestHelpers['state'];

	test.beforeEach(async ({demoPage, page}) => {
		await demoPage.goto();

		({component, provider, state} = await createTestHelpers(page));
		await provider.start();
	});

	test('Initial state', async () => {
		const
			chunkSize = 12,
			mockFn = await component.mockFn((ctx: bVirtualScrollNew) => ctx.getVirtualScrollState());

		provider.response(200, {data: []}, {delay: (10).seconds()});

		const expectedState = state.compile({
			lastLoadedRawData: undefined,
			remainingItems: undefined,
			remainingChildren: undefined,
			maxViewedItem: undefined,
			maxViewedChild: undefined,
			areRequestsStopped: false,
			isLoadingInProgress: true,
			lastLoadedData: [],
			loadPage: 0
		});

		await component
			.withDefaultPaginationProviderProps({chunkSize})
			.withProps({
				'@hook:created': mockFn
			})
			.build();

		await test.expect(mockFn.results).resolves.toEqual([{type: 'return', value: expectedState}]);
	});

	test('State after loading first and second data chunks', async () => {
		const
			chunkSize = 12,
			providerChunkSize = chunkSize / 2;

		const
			shouldStopRequestingData = <ShouldPerform>(defaultShouldProps.shouldStopRequestingData),
			shouldPerformDataRender = <ShouldPerform>(({isInitialRender, remainingItems: remainingItems}) =>
				isInitialRender || remainingItems === 0);

		await test.step('After rendering first data chunk', async () => {
			provider
				.responseOnce(200, {data: state.data.addData(providerChunkSize)})
				.responseOnce(200, {data: state.data.addData(providerChunkSize)});

			state.data.addItems(chunkSize);

			await component
				.withDefaultPaginationProviderProps({chunkSize: providerChunkSize})
				.withProps({
					chunkSize,
					shouldStopRequestingData,
					shouldPerformDataRender
				})
				.build();

			await component.waitForChildCountEqualsTo(chunkSize);

			const
				currentState = await component.getVirtualScrollState();

			test.expect(currentState).toEqual(state.compile({
				isInitialLoading: false,
				isInitialRender: false,
				areRequestsStopped: false,
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
			await component.waitForChildCountEqualsTo(chunkSize * 2);
			await component.scrollToBottom();
			await component.waitForLifecycleDone();

			const
				currentState = await component.getVirtualScrollState();

			test.expect(currentState).toEqual(state.compile({
				isInitialLoading: false,
				isInitialRender: false,
				areRequestsStopped: true,
				isLoadingInProgress: false,
				isLastEmpty: true,
				isLifecycleDone: true,
				isLastRender: true,
				loadPage: 5,
				renderPage: 2
			}));
		});
	});

	test.describe('state after rendering via `itemsFactory`', () => {
		test('`itemsFactory` returns mixed items with `item` and `separator` type', async () => {
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

			const item = (data): ComponentItem => ({
				item: 'section',
				key: Object.cast(undefined),
				type: 'item',
				props: {
					'data-index': data.i
				},
				meta: {
					data
				}
			});

			const compileItemsFn = (state, ctx, separator, item) => {
				const
					data = state.lastLoadedData,
					result: ComponentItem[] = [];

				data.forEach((data) => {
					result.push(separator, item(data));
				});

				return result;
			};

			const itemsFactory = await component.mockFn(compileItemsFn, separator, item);

			provider
				.responseOnce(200, {data: state.data.addData(chunkSize)})
				.response(200, {data: state.data.addData(0)});

			state.data.addChild(compileItemsFn({lastLoadedData: state.data.data}, null, separator, item));

			await component
				.withDefaultPaginationProviderProps({chunkSize})
				.withProps({
					itemsFactory,
					shouldPerformDataRender: () => true,
					chunkSize
				})
				.build();

			await component.waitForChildCountEqualsTo(chunkSize * 2);
			await component.waitForLifecycleDone();

			const
				currentState = await component.getVirtualScrollState();

			test.expect(currentState).toEqual(state.compile({
				isInitialLoading: false,
				isInitialRender: false,
				areRequestsStopped: true,
				isLoadingInProgress: false,
				isLastEmpty: true,
				isLifecycleDone: true,
				isLastRender: true,
				loadPage: 2,
				renderPage: 1
			}));
		});

		test('`itemsFactory` returns items with `item` and last item with `separator` type', async () => {
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
					},
					meta: {
						data: item
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

			await component
				.withDefaultPaginationProviderProps({chunkSize})
				.withProps({
					itemsFactory,
					shouldPerformDataRender: () => true,
					chunkSize
				})
				.build();

			await component.waitForChildCountEqualsTo(chunkSize + 1);
			await component.waitForLifecycleDone();

			const
				currentState = await component.getVirtualScrollState();

			test.expect(currentState).toEqual(state.compile({
				isInitialLoading: false,
				isInitialRender: false,
				areRequestsStopped: true,
				isLoadingInProgress: false,
				isLastEmpty: true,
				isLifecycleDone: true,
				isLastRender: true,
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

			await component
				.withDefaultPaginationProviderProps({chunkSize})
				.withProps({
					itemsFactory,
					shouldPerformDataRender: () => true,
					chunkSize
				})
				.build();

			await component.waitForChildCountEqualsTo(chunkSize);
			await component.waitForLifecycleDone();

			const
				currentState = await component.getVirtualScrollState();

			test.expect(currentState).toEqual(state.compile({
				isInitialLoading: false,
				isInitialRender: false,
				areRequestsStopped: true,
				isLoadingInProgress: false,
				isLastEmpty: true,
				isLifecycleDone: true,
				isLastRender: true,
				maxViewedItem: undefined,
				loadPage: 2,
				renderPage: 1
			}));
		});
	});
});
