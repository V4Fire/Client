/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * @file Basic test cases for component rendering functionality.
 */

import test from 'tests/config/unit/test';

import { Scroll } from 'tests/helpers';

import type { VirtualScrollState, ShouldPerform } from 'components/base/b-virtual-scroll-new/interface';
import { createTestHelpers } from 'components/base/b-virtual-scroll-new/test/api/helpers';
import type { VirtualScrollTestHelpers } from 'components/base/b-virtual-scroll-new/test/api/helpers/interface';
import type bVirtualScrollNew from 'components/base/b-virtual-scroll-new/b-virtual-scroll-new';

test.describe('<b-virtual-scroll-new>', () => {
	let
		component: VirtualScrollTestHelpers['component'],
		provider: VirtualScrollTestHelpers['provider'],
		state: VirtualScrollTestHelpers['state'];

	test.beforeEach(async ({demoPage, page}) => {
		await demoPage.goto();

		({component, provider, state} = await createTestHelpers(page));
		await provider.start();

		await page.setViewportSize({height: 640, width: 360});
	});

	test.describe('`chunkSize` is 12', () => {
		test.describe('provider can provide 3 data chunks', () => {
			test('Should render 36 items', async () => {
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

				await component
					.withDefaultPaginationProviderProps({chunkSize})
					.withProps({
						shouldPerformDataRender,
						chunkSize
					});

				await component.build();
				await component.waitForChildCountEqualsTo(chunkSize);
				await component.scrollToBottom();
				await component.waitForChildCountEqualsTo(chunkSize * 2);
				await component.scrollToBottom();
				await component.waitForChildCountEqualsTo(chunkSize * 3);
				await component.scrollToBottom();
				await component.waitForChildCountEqualsTo(chunkSize * 3);

				await test.expect(component.childList).toHaveCount(chunkSize * 3);
			});
		});
	});

	test.describe('with a different chunk size for each render cycle', () => {
		test('Should render 6 components first, then 12, then 18', async () => {
			const chunkSize = [6, 12, 18];

			provider
				.responseOnce(200, {data: state.data.addData(chunkSize[0])})
				.responseOnce(200, {data: state.data.addData(chunkSize[1])})
				.responseOnce(200, {data: state.data.addData(chunkSize[2])})
				.response(200, {data: []});

			await component
				.withDefaultPaginationProviderProps()
				.withProps({
					chunkSize: (state: VirtualScrollState) => [6, 12, 18][state.renderPage] ?? 18
				});

			await component.build();

			await test.step('First chunk', async () => {
				const
					expectedIndex = chunkSize[0];

				await test.expect(component.waitForChildCountEqualsTo(expectedIndex)).resolves.toBeUndefined();
				await test.expect(component.waitForDataIndexChild(expectedIndex - 1)).resolves.toBeUndefined();
			});

			await test.step('Second chunk', async () => {
				const
					expectedIndex = chunkSize[0] + chunkSize[1];

				await component.scrollToBottom();

				await test.expect(component.waitForChildCountEqualsTo(expectedIndex)).resolves.toBeUndefined();
				await test.expect(component.waitForDataIndexChild(expectedIndex - 1)).resolves.toBeUndefined();
			});

			await test.step('Third chunk', async () => {
				const
					expectedIndex = chunkSize[0] + chunkSize[1] + chunkSize[2];

				await component.scrollToBottom();

				await test.expect(component.waitForChildCountEqualsTo(expectedIndex)).resolves.toBeUndefined();
				await test.expect(component.waitForDataIndexChild(expectedIndex - 1)).resolves.toBeUndefined();
			});

			await test.step('Lifecycle is done', async () => {
				await component.scrollToBottom();

				await test.expect(component.waitForLifecycleDone()).resolves.toBeUndefined();
			});
		});
	});

	test.describe('`chunkSize` is 6', () => {
		test.describe('provider responded once, returning 45 elements', () => {
			test.describe('`shouldStopRequestingData` returns true after first request', () => {
				test('should render all 45 elements within 8 rendering cycles', async () => {
					const
						chunkSize = 6,
						providerChunkSize = 45;

					provider
						.responseOnce(200, {data: state.data.addData(providerChunkSize)});

					const shouldPerformDataRender = await component.mockFn<ShouldPerform>(
						({isInitialRender, remainingItems: remainingItems}) => isInitialRender || remainingItems === 0
					);

					await component
						.withDefaultPaginationProviderProps({chunkSize})
						.withProps({
							shouldPerformDataRender,
							shouldStopRequestingData: () => true,
							chunkSize,
							'@hook:beforeDataCreate': (ctx: bVirtualScrollNew) => jestMock.spy(ctx.unsafe.componentFactory, 'produceNodes')
						});

					await component.build();

					await Scroll.scrollToBottomWhile(component.pwPage, async () => {
						const
							isEqual = await component.getChildCount() === providerChunkSize;

						return isEqual;
					});

					const
						spy = await component.getSpy((ctx) => ctx.unsafe.componentFactory.produceNodes);

					await test.expect(spy.callsCount).resolves.toBe(7);
					await test.expect(component.childList).toHaveCount(providerChunkSize);
				});
			});
		});
	});
});
