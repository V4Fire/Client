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

import type bVirtualScrollNew from 'components/base/b-virtual-scroll-new/b-virtual-scroll-new';
import { createTestHelpers } from 'components/base/b-virtual-scroll-new/test/api/helpers';
import type { VirtualScrollTestHelpers } from 'components/base/b-virtual-scroll-new/test/api/helpers/interface';
import { BOM } from 'tests/helpers';

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
		test('should render the second chunk with the new chunk size', async () => {
			const
				chunkSize = 12;

			provider.response(200, () => ({data: state.data.addData(chunkSize)}));

			await component
				.withDefaultPaginationProviderProps({chunkSize})
				.withProps({
					chunkSize,
					'@hook:beforeDataCreate': (ctx: bVirtualScrollNew['unsafe']) => jestMock.spy(ctx.componentFactory, 'produceComponentItems')
				})
				.build({useDummy: true});

			await component.waitForChildCountEqualsTo(chunkSize);
			await component.updateProps({chunkSize: chunkSize * 2});
			await component.scrollToBottom();
			await component.waitForChildCountEqualsTo(chunkSize * 3);

			const
				produceSpy = await component.getSpy((ctx) => ctx.unsafe.componentFactory.produceComponentItems);

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
					'@hook:beforeDataCreate': (ctx: bVirtualScrollNew['unsafe']) => jestMock.spy(ctx.componentFactory, 'produceComponentItems')
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
			test('should not continue to load data', async ({page}) => {
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

				const ctx = await component.component;
				await page.waitForFunction(([ctx]) => ctx.getVirtualScrollState().areRequestsStopped, [ctx]);

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

				const ctx = await component.component;
				await page.waitForFunction(([ctx]) => ctx.getVirtualScrollState().areRequestsStopped, [ctx]);
				await component.waitForChildCountEqualsTo(chunkSize);
				await component.scrollToBottom();
				await component.waitForChildCountEqualsTo(chunkSize * 2);
				await component.scrollToBottom();

				await test.expect(component.waitForLifecycleDone()).resolves.toBeUndefined();
			});
		});
	});

	test.describe('request', () => {
		test.describe('the prop has changed while the first loading process is in progress', () => {
			test('should ignore first loading and reset state', async ({page}) => {
				const
					chunkSize = 12;

				provider.response(200, () => ({data: state.data.addData(chunkSize)}));
				provider.responder();

				await component
					.withDefaultPaginationProviderProps({chunkSize})
					.withProps({
						chunkSize,
						request: {get: {test: 1}},
						'@hook:beforeDataCreate': (ctx) => {
							const original = ctx.emit;

							ctx.emit = jestMock.mock((...args) => {
								original(...args);
								return [args[0], Object.fastClone(ctx.getVirtualScrollState())];
							});
						}
					})
					.build({useDummy: true});

				await BOM.waitForIdleCallback(page);
				await component.updateProps({request: {get: {test: 2}}});
				await BOM.waitForIdleCallback(page);
				await provider.unresponder();
				await component.waitForChildCountEqualsTo(chunkSize);

				const
					virtualScrolLState = await component.getVirtualScrollState(),
					spy = await component.getSpy((ctx) => ctx.emit),
					loadSuccessCalls = (await spy.results).filter(({value: [event]}) => event === 'dataLoadSuccess');

				test.expect(loadSuccessCalls).toHaveLength(1);
				test.expect(virtualScrolLState.data).toHaveLength(chunkSize);
				test.expect(virtualScrolLState.data[0]).toMatchObject({i: 12});
			});
		});
	});
});
