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

import { createTestHelpers } from 'components/base/b-virtual-scroll-new/test/api/helpers';
import type { VirtualScrollTestHelpers } from 'components/base/b-virtual-scroll-new/test/api/helpers/interface';
import Async from 'core/async';

test.describe('<b-virtual-scroll-new>', () => {
	let
		component: VirtualScrollTestHelpers['component'],
		provider: VirtualScrollTestHelpers['provider'];

	test.beforeEach(async ({demoPage, page}) => {
		await demoPage.goto();

		({component, provider} = await createTestHelpers(page));
		await provider.start();

		await page.setViewportSize({height: 640, width: 360});
	});

	test('should perform normalization of attributes for components that are rendered', async () => {
		await component
			.withProps({
				item: 'b-button',
				itemProps: (item) => ({
					dataProvider: 'Provider',
					request: {
						get: {
							buttonRequest: true
						}
					},
					'data-index': item.i
				})
			})
			.withPaginationProvider()
			.withRequestPaginationProps()
			.build();

		await component.waitForDataIndexChild(1);

		const async = new Async();
		await async.wait(() => provider.calls.length >= 2);

		await test.expect(provider.request(-1)?.query()).toEqual({
			buttonRequest: true
		});
	});
});
