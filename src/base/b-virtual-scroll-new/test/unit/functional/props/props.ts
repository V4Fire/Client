/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * @file This file contains test cases to verify the functionality of props in the component.
 */

import type { Route } from 'playwright';

import test from 'tests/config/unit/test';

import { fromQueryString } from 'core/url';

import type bVirtualScrollNew from 'base/b-virtual-scroll-new/b-virtual-scroll-new';
import { createTestHelpers } from 'base/b-virtual-scroll-new/test/api/helpers';
import type { VirtualScrollTestHelpers } from 'base/b-virtual-scroll-new/test/api/helpers/interface';

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

	test.describe('`chunkSize` prop changes after the first chunk has been rendered', () => {
		test('should render the second chunk with the new chunk size', async ({page}) => {
			const
				chunkSize = 12;

			provider.response(200, () => ({data: state.data.addData(chunkSize)}));

			await component
				.withDefaultPaginationProviderProps({chunkSize})
				.withProps({
					chunkSize,
					'@componentHook:beforeDataCreate': (ctx: bVirtualScrollNew['unsafe']) => jestMock.spy(ctx.componentFactory, 'produceComponentItems')
				})
				.build({useDummy: true});

			await page.pause();
			await component.waitForChildCountEqualsTo(chunkSize);
			await component.updateProps({chunkSize: chunkSize * 2});
			await component.scrollToBottom();
			await component.waitForChildCountEqualsTo(chunkSize * 3);

			const
				produceSpy = await component.getSpy((ctx) => ctx.componentFactory.produceComponentItems);

			test.expect(provider.mock.mock.calls.length).toBe(3);
			await test.expect(produceSpy.calls).resolves.toHaveLength(2);
			await test.expect(component.waitForChildCountEqualsTo(chunkSize * 3)).resolves.toBeUndefined();
			await test.expect(component.waitForDataIndexChild(chunkSize * 3 - 1)).resolves.toBeUndefined();
		});
	});

	test.describe('`requestQuery`', () => {
		test('should pass the parameters to the GET parameters of the request', async () => {
			const
				chunkSize = 12;

			provider.response(200, () => ({data: state.data.addData(chunkSize)}));

			await component
				.withDefaultPaginationProviderProps({chunkSize})
				.withProps({
					chunkSize,
					requestQuery: () => ({get: {param1: 'param1'}}),
					shouldPerformDataRequest: () => false,
					'@componentHook:beforeDataCreate': (ctx: bVirtualScrollNew['unsafe']) => jestMock.spy(ctx.componentFactory, 'produceComponentItems')
				})
				.build();

			await component.waitForChildCountEqualsTo(chunkSize);

			const
				providerCalls = provider.mock.mock.calls,
				query = fromQueryString(new URL((<Route>providerCalls[0][0]).request().url()).search);

			test.expect(providerCalls).toHaveLength(1);
			test.expect(query).toEqual({
				param1: 'param1',
				chunkSize: 12,
				id: test.expect.anything()
			});
		});
	});

	test.describe('`dbConverter`', () => {
		test('should convert data to the component', async () => {
			const
				chunkSize = 12;

			provider.response(200, () => ({data: {nestedData: state.data.addData(chunkSize)}}));

			await component
				.withDefaultPaginationProviderProps({chunkSize})
				.withProps({
					chunkSize,
					shouldPerformDataRequest: () => false,
					dbConverter: ({data: {nestedData}}) => ({data: nestedData})
				})
				.build();

			await test.expect(component.waitForChildCountEqualsTo(chunkSize)).resolves.toBeUndefined();
		});

		test('should convert second data chunk to the component', async () => {
			const
				chunkSize = 12;

			provider.response(200, () => ({data: {nestedData: state.data.addData(chunkSize)}}));

			await component
				.withDefaultPaginationProviderProps({chunkSize})
				.withProps({
					chunkSize,
					shouldPerformDataRequest: ({remainingItems}) => remainingItems === 0,
					dbConverter: ({data: {nestedData}}) => ({data: nestedData})
				})
				.build();

			await component.waitForChildCountEqualsTo(chunkSize);
			await component.scrollToBottom();

			await test.expect(component.waitForChildCountEqualsTo(chunkSize * 2)).resolves.toBeUndefined();
		});
	});

	test.describe('`itemsProcessors`', () => {
		test('should modify components before rendering', async () => {
			const
				chunkSize = 12;

			provider.response(200, () => ({data: state.data.addData(chunkSize)}));

			await component
				.withDefaultPaginationProviderProps({chunkSize})
				.withProps({
					chunkSize,
					shouldPerformDataRequest: () => false,
					itemsProcessors: (items) => items.concat([
						{
							item: 'b-dummy',
							type: 'separator',
							props: {},
							key: 'uniq'
						}
					])
				})
				.build();

			await test.expect(component.waitForChildCountEqualsTo(chunkSize + 1)).resolves.toBeUndefined();
			await test.expect(component.container.locator('.b-dummy')).toHaveCount(1);
		});
	});

	test.describe('`preloadAmount`', () => {
		test('should preload 30 data items', async () => {
			const
				chunkSize = 10,
				preloadAmount = 30;

			provider.response(200, () => ({data: state.data.addData(chunkSize)}));

			await component
				.withDefaultPaginationProviderProps({chunkSize})
				.withProps({
					chunkSize,
					preloadAmount
				})
				.build();

			await component.waitForChildCountEqualsTo(chunkSize);

			const
				currentState = await component.getVirtualScrollState();

			test.expect(currentState.data).toHaveLength(chunkSize + preloadAmount);
		});

		test.describe('`shouldStopRequestingData` returns true during preload requests', () => {
			test('should not continue to load data', async () => {
				const
					chunkSize = 10,
					preloadAmount = 30;

				provider
					.responseOnce(200, state.data.addData(chunkSize))
					.responseOnce(200, state.data.addData(chunkSize))
					.responseOnce(200, []);

				await component
					.withDefaultPaginationProviderProps({chunkSize})
					.withProps({
						chunkSize,
						preloadAmount
					})
					.build();

				await component.waitForChildCountEqualsTo(chunkSize);

				const
					currentState = await component.getVirtualScrollState();

				test.expect(provider.calls).toHaveLength(3);
				test.expect(currentState.data).toHaveLength(20);
			});

			test('should not complete the lifecycle until all elements have been rendered', async () => {
				const
					chunkSize = 10,
					preloadAmount = 30;

				provider
					.responseOnce(200, state.data.addData(chunkSize))
					.responseOnce(200, state.data.addData(chunkSize))
					.responseOnce(200, []);

				await component
					.withDefaultPaginationProviderProps({chunkSize})
					.withProps({
						chunkSize,
						preloadAmount
					})
					.build();

				await component.waitForChildCountEqualsTo(chunkSize);

				const
					currentState = await component.getVirtualScrollState();

				test.expect(currentState.isLifecycleDone).toBe(false);
			});

			test('should complete the lifecycle when all elements have been rendered', async ({page}) => {
				const
					chunkSize = 10,
					preloadAmount = 30;

				provider
					.responseOnce(200, state.data.addData(chunkSize))
					.responseOnce(200, state.data.addData(chunkSize))
					.responseOnce(200, []);

				await component
					.withDefaultPaginationProviderProps({chunkSize})
					.withProps({
						chunkSize,
						preloadAmount
					})
					.build();

				await page.waitForFunction(([ctx]) => ctx.getVirtualScrollState().areRequestsStopped, [component.component]);
				await component.waitForChildCountEqualsTo(chunkSize);
				await component.scrollToBottom();
				await component.waitForChildCountEqualsTo(chunkSize * 2);
				await component.scrollToBottom();

				await test.expect(component.waitForLifecycleDone()).resolves.toBeUndefined();
			});
		});
	});
});
