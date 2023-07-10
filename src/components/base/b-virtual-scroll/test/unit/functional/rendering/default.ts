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

import type { VirtualScrollState, ShouldPerform } from 'components/base/b-virtual-scroll/interface';
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

		await page.setViewportSize({height: 640, width: 360});
	});

	test.describe('ChunkSize is 12', () => {
		test.describe('Provider can provide 3 data chunks', () => {
			test('Should render 36 items', async () => {
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

				await component
					.withDefaultPaginationProviderProps({chunkSize})
					.withProps({
						shouldPerformDataRender,
						chunkSize
					});

				await component.build();
				await component.waitForContainerChildCountEqualsTo(chunkSize);
				await component.scrollToBottom();
				await component.waitForContainerChildCountEqualsTo(chunkSize * 2);
				await component.scrollToBottom();
				await component.waitForContainerChildCountEqualsTo(chunkSize * 3);
				await component.scrollToBottom();
				await component.waitForContainerChildCountEqualsTo(chunkSize * 3);

				await test.expect(component.childList).toHaveCount(chunkSize * 3);
			});
		});
	});

	test.describe('With a different chunk size for each render cycle', () => {
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

				await test.expect(component.waitForContainerChildCountEqualsTo(expectedIndex)).resolves.toBeUndefined();
				await test.expect(component.waitForDataIndexChild(expectedIndex - 1)).resolves.toBeUndefined();
			});

			await test.step('Second chunk', async () => {
				const
					expectedIndex = chunkSize[0] + chunkSize[1];

				await component.scrollToBottom();

				await test.expect(component.waitForContainerChildCountEqualsTo(expectedIndex)).resolves.toBeUndefined();
				await test.expect(component.waitForDataIndexChild(expectedIndex - 1)).resolves.toBeUndefined();
			});

			await test.step('Third chunk', async () => {
				const
					expectedIndex = chunkSize[0] + chunkSize[1] + chunkSize[2];

				await component.scrollToBottom();

				await test.expect(component.waitForContainerChildCountEqualsTo(expectedIndex)).resolves.toBeUndefined();
				await test.expect(component.waitForDataIndexChild(expectedIndex - 1)).resolves.toBeUndefined();
			});

			await test.step('Lifecycle is done', async () => {
				await component.scrollToBottom();

				await test.expect(component.waitForLifecycleDone()).resolves.toBeUndefined();
			});
		});
	});
});
