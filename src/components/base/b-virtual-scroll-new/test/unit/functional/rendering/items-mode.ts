/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * @file Basic test cases for component rendering data provided in items prop.
 */

import test from 'tests/config/unit/test';

import type { ShouldPerform } from 'components/base/b-virtual-scroll-new/interface';
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

		await page.setViewportSize({height: 640, width: 360});
	});

	test.describe('`chunkSize` is 12', () => {
		test.describe('provided 36 elements in the items prop', () => {
			test('should render 36 items', async () => {
				const
					chunkSize = 12;

				const items = [
					...state.data.addData(chunkSize),
					...state.data.addData(chunkSize),
					...state.data.addData(chunkSize)
				];

				const shouldPerformDataRender = await component.mockFn<ShouldPerform>(
					({isInitialRender, remainingItems: remainingItems}) => isInitialRender || remainingItems === 0
				);

				await component
					.withPaginationItemProps()
					.withProps({
						shouldPerformDataRender,
						chunkSize,
						items
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
});
