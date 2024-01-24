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

import type bVirtualScroll from 'components/base/b-virtual-scroll/b-virtual-scroll';
import { createTestHelpers } from 'components/base/b-virtual-scroll/test/api/helpers';
import type { VirtualScrollTestHelpers } from 'components/base/b-virtual-scroll/test/api/helpers/interface';

test.describe('<b-virtual-scroll>', () => {
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
		test('Should render the second chunk with the new chunk size', async () => {
			const
				chunkSize = 12;

			provider.response(200, () => ({data: state.data.addData(chunkSize)}));

			await component
				.withDefaultPaginationProviderProps({chunkSize})
				.withProps({
					chunkSize,
					'@hook:beforeDataCreate': (ctx: bVirtualScroll['unsafe']) => jestMock.spy(ctx.componentFactory, 'produceComponentItems')
				})
				.build({useDummy: true});

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
		test('Should pass the parameters to the GET parameters of the request', async () => {
			const
				chunkSize = 12;

			provider.response(200, () => ({data: state.data.addData(chunkSize)}));

			await component
				.withDefaultPaginationProviderProps({chunkSize})
				.withProps({
					chunkSize,
					requestQuery: () => ({get: {param1: 'param1'}}),
					shouldPerformDataRequest: () => false,
					'@hook:beforeDataCreate': (ctx: bVirtualScroll['unsafe']) => jestMock.spy(ctx.componentFactory, 'produceComponentItems')
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
		test('Should convert data to the component', async () => {
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

		test('Should convert second data chunk to the component', async () => {
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
		test('Should modify components before rendering', async () => {
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
});
