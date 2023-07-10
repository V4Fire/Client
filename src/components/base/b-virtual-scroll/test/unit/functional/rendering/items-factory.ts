/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * @file Test cases of the component `itemsFactory` prop.
 */

import test from 'tests/config/unit/test';

import type { ComponentItemFactory, ComponentItem, ShouldPerform } from 'components/base/b-virtual-scroll/interface';

import { createTestHelpers } from 'components/base/b-virtual-scroll/test/api/helpers';
import type { VirtualScrollTestHelpers } from 'components/base/b-virtual-scroll/test/api/helpers/interface';

test.describe('<b-virtual-scroll> rendering via itemsFactory', () => {
	let
		component: VirtualScrollTestHelpers['component'],
		provider: VirtualScrollTestHelpers['provider'],
		state: VirtualScrollTestHelpers['state'];

	test.beforeEach(async ({demoPage, page}) => {
		await demoPage.goto();

		({component, provider, state} = await createTestHelpers(page));
		await provider.start();
	});

	test.describe('Returned items with type `item` is equal to the provided data', () => {
		test('Should render all of the items that was returned from `itemsFactory`', async () => {
			const
				chunkSize = 12;

			provider
				.responseOnce(200, {data: state.data.addData(chunkSize)})
				.response(200, {data: state.data.addData(0)});

			const itemsFactory = await component.mockFn<ComponentItemFactory<{i: number}>>((state) => {
				const data = state.lastLoadedData;

				return data.map((item) => ({
					item: 'section',
					key: Object.cast(undefined),
					type: 'item',
					children: [],
					props: {
						'data-index': item.i
					}
				}));
			});

			await component
				.withDefaultPaginationProviderProps({chunkSize})
				.withProps({
					itemsFactory,
					shouldPerformDataRender: () => true,
					chunkSize
				})
				.build();

			await component.waitForContainerChildCountEqualsTo(chunkSize);

			await test.expect(component.childList).toHaveCount(chunkSize);
		});
	});

	test.describe('In additional `item`, `separator` was also returned', () => {
		test('Should render both', async () => {
			const
				chunkSize = 12;

			provider
				.responseOnce(200, {data: state.data.addData(chunkSize)})
				.response(200, {data: state.data.addData(0)});

			const separator = {
				item: 'b-button',
				key: '',
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
					children: [],
					props: {
						'data-index': item.i
					}
				}));

				items.push(separator);

				return items;
			}, separator);

			await component
				.withDefaultPaginationProviderProps({chunkSize})
				.withProps({
					itemsFactory,
					shouldPerformDataRender: () => true,
					chunkSize
				})
				.build();

			await component.waitForContainerChildCountEqualsTo(chunkSize + 1);

			await test.expect(component.container.locator('#button')).toBeVisible();
			await test.expect(component.childList).toHaveCount(chunkSize + 1);
		});
	});

	test.describe('Returned items with type `item` is less than the provided data', () => {
		test('Should render items that was returned from `itemsFactory`', async () => {
			const
				chunkSize = 12,
				renderedChunkSize = chunkSize - 2;

			provider
				.responseOnce(200, {data: state.data.addData(chunkSize)})
				.response(200, {data: state.data.addData(0)});

			const itemsFactory = await component.mockFn<ComponentItemFactory<{i: number}>>((state) => {
				const data = state.lastLoadedData;

				const items = data.map<ComponentItem>((item) => ({
					item: 'section',
					key: Object.cast(undefined),
					type: 'item',
					children: [],
					props: {
						'data-index': item.i
					}
				}));

				items.length -= 2;
				return items;
			});

			await component
				.withDefaultPaginationProviderProps({chunkSize})
				.withProps({
					itemsFactory,
					shouldPerformDataRender: () => true,
					chunkSize
				})
				.build();

			await component.waitForContainerChildCountEqualsTo(renderedChunkSize);

			await test.expect(component.childList).toHaveCount(renderedChunkSize);
		});
	});

	test.describe('Returned item with type `item` is more than the provided data', () => {
		test('Should render items that was returned from `itemsFactory`', async () => {
			const
				chunkSize = 12,
				renderedChunkSize = chunkSize * 2;

			provider
				.responseOnce(200, {data: state.data.addData(chunkSize)})
				.response(200, {data: state.data.addData(0)});

			const itemsFactory = await component.mockFn<ComponentItemFactory<{i: number}>>((state) => {
				const data = state.lastLoadedData;

				const items = data.map<ComponentItem>((item) => ({
					item: 'section',
					key: Object.cast(undefined),
					type: 'item',
					children: [],
					props: {
						'data-index': item.i
					}
				}));

				return [...items, ...items];
			});

			await component
				.withDefaultPaginationProviderProps({chunkSize})
				.withProps({
					itemsFactory,
					shouldPerformDataRender: () => true,
					chunkSize
				})
				.build();

			await component.waitForContainerChildCountEqualsTo(renderedChunkSize);

			await test.expect(component.childList).toHaveCount(renderedChunkSize);
		});
	});

	test.describe('`item` was not returned, but equal to the number of data, the number of `separator` was returned', () => {
		test('Should render separators that was returned from `itemsFactory`', async () => {
			const
				chunkSize = 12;

			provider
				.responseOnce(200, {data: state.data.addData(chunkSize)})
				.response(200, {data: state.data.addData(0)});

			const itemsFactory = await component.mockFn<ComponentItemFactory<{i: number}>>((state) => {
				const data = state.lastLoadedData;

				return data.map((item) => ({
					item: 'section',
					key: Object.cast(undefined),
					type: 'separator',
					children: [],
					props: {
						'data-index': item.i
					}
				}));
			});

			await component
				.withDefaultPaginationProviderProps({chunkSize})
				.withProps({
					itemsFactory,
					shouldPerformDataRender: () => true,
					chunkSize
				})
				.build();

			await component.waitForContainerChildCountEqualsTo(chunkSize);

			await test.expect(component.childList).toHaveCount(chunkSize);
		});
	});

	test.describe('`itemsFactory` returns twice as much data as `chunkSize`', () => {
		test('Should render twice as much items as `chunkSize`', async () => {
			const
				chunkSize = 12;

			provider
				.responseOnce(200, {data: state.data.addData(chunkSize)})
				.responseOnce(200, {data: state.data.addData(chunkSize)})
				.responseOnce(200, {data: state.data.addData(chunkSize)})
				.response(200, {data: state.data.addData(0)});

			const shouldPerformDataRender = await component.mockFn<ShouldPerform>(
				({isInitialRender, itemsTillEnd}) => isInitialRender || itemsTillEnd === 0
			);

			const itemsFactory = await component.mockFn<ComponentItemFactory<{i: number}>>((state) => {
				const data = state.lastLoadedData;

				const items = data.map<ComponentItem>((item) => ({
					item: 'section',
					key: Object.cast(undefined),
					type: 'item',
					children: [],
					props: {
						'data-index': item.i
					}
				}));

				return [...items, ...items];
			});

			await component
				.withDefaultPaginationProviderProps({chunkSize})
				.withProps({
					itemsFactory,
					shouldPerformDataRender,
					chunkSize
				})
				.build();

			await component.waitForContainerChildCountEqualsTo(chunkSize * 2);
			await component.scrollToBottom();
			await component.waitForContainerChildCountEqualsTo(chunkSize * 2 * 2);
			await component.scrollToBottom();
			await component.waitForContainerChildCountEqualsTo(chunkSize * 3 * 2);
			await component.scrollToBottom();
			await component.waitForContainerChildCountEqualsTo(chunkSize * 3 * 2);

			await test.expect(component.childList).toHaveCount(chunkSize * 3 * 2);
		});
	});
});
