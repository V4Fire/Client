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

import type { ComponentItemFactory, ComponentItem, ShouldPerform, VirtualScrollState } from 'components/base/b-virtual-scroll-new/interface';

import { createTestHelpers } from 'components/base/b-virtual-scroll-new/test/api/helpers';
import type { VirtualScrollTestHelpers } from 'components/base/b-virtual-scroll-new/test/api/helpers/interface';

test.describe('<b-virtual-scroll-new> rendering via itemsFactory', () => {
	let
		component: VirtualScrollTestHelpers['component'],
		provider: VirtualScrollTestHelpers['provider'],
		state: VirtualScrollTestHelpers['state'];

	test.beforeEach(async ({demoPage, page}) => {
		await demoPage.goto();

		({component, provider, state} = await createTestHelpers(page));
		await provider.start();
	});

	test.describe('returned items with type `item` is equal to the provided data', () => {
		test('should render all of the items that were returned from `itemsFactory`', async () => {
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

			await component.waitForChildCountEqualsTo(chunkSize);

			await test.expect(component.childList).toHaveCount(chunkSize);
		});
	});

	test.describe('In additional `item`, `separator` was also returned', () => {
		test('should render both', async () => {
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

			const itemsFactory = await component.mockFn((state: VirtualScrollState, ctx, separator) => {
				const
					data = <Array<{i: number}>>state.lastLoadedData;

				const items = data.map((item) => ({
					item: 'section',
					key: Object.cast(undefined),
					type: 'item',
					children: [],
					props: {
						'data-index': item.i
					}
				}));

				if (items.length > 0) {
					items.push(separator);
				}

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

			await component.waitForChildCountEqualsTo(chunkSize + 1);

			await test.expect(component.container.locator('#button')).toBeVisible();
			await test.expect(component.childList).toHaveCount(chunkSize + 1);
		});
	});

	test.describe('returned items with type `item` is less than the provided data', () => {
		test('should render items that were returned from `itemsFactory`', async () => {
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

			await component.waitForChildCountEqualsTo(renderedChunkSize);

			await test.expect(component.childList).toHaveCount(renderedChunkSize);
		});
	});

	test.describe('returned item with type `item` is more than the provided data', () => {
		test('should render items that were returned from `itemsFactory`', async () => {
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

			await component.waitForChildCountEqualsTo(renderedChunkSize);

			await test.expect(component.childList).toHaveCount(renderedChunkSize);
		});
	});

	test.describe('The items of type `item` were not returned, but the items of type `separator` were returned in the same quantity as the loaded data.', () => {
		test('should render separators that were returned from `itemsFactory`', async () => {
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

			await component.waitForChildCountEqualsTo(chunkSize);

			await test.expect(component.childList).toHaveCount(chunkSize);
		});
	});

	test.describe('`itemsFactory` returns twice as much data as the `chunkSize`', () => {
		test('should render twice as much items as the `chunkSize`', async () => {
			const
				chunkSize = 12;

			provider
				.responseOnce(200, {data: state.data.addData(chunkSize)})
				.responseOnce(200, {data: state.data.addData(chunkSize)})
				.responseOnce(200, {data: state.data.addData(chunkSize)})
				.response(200, {data: state.data.addData(0)});

			const shouldPerformDataRender = await component.mockFn<ShouldPerform>(
				({isInitialRender, remainingItems: remainingItems}) => isInitialRender || remainingItems === 0
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

			await component.waitForChildCountEqualsTo(chunkSize * 2);
			await component.scrollToBottom();
			await component.waitForChildCountEqualsTo(chunkSize * 2 * 2);
			await component.scrollToBottom();
			await component.waitForChildCountEqualsTo(chunkSize * 3 * 2);
			await component.scrollToBottom();
			await component.waitForChildCountEqualsTo(chunkSize * 3 * 2);

			await test.expect(component.childList).toHaveCount(chunkSize * 3 * 2);
		});
	});
});
