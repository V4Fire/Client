/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * @file Test cases of the component lifecycle
 */

import test from 'tests/config/unit/test';

import { createTestHelpers } from 'components/base/b-scrolly/test/api/helpers';
import type { ShouldFn } from 'components/base/b-scrolly/interface';

test.describe('<b-scrolly> rendering via component factory', () => {
	let
		component: Awaited<ReturnType<typeof createTestHelpers>>['component'],
		provider:Awaited<ReturnType<typeof createTestHelpers>>['provider'],
		state: Awaited<ReturnType<typeof createTestHelpers>>['state'];

	test.beforeEach(async ({demoPage, page}) => {
		await demoPage.goto();

		({component, provider, state} = await createTestHelpers(page));
		await provider.start();
	});

	test('Should render all loaded data', async () => {
		const
			chunkSize = 12;

		provider
			.responseOnce(200, {data: state.data.addData(chunkSize)})
			.responseOnce(200, {data: state.data.addData(chunkSize)})
			.responseOnce(200, {data: state.data.addData(chunkSize)})
			.response(200, {data: state.data.addData(0)});

		const shouldPerformDataRender = await component.mockFn<ShouldFn>(
			({isInitialRender, itemsTillEnd}) => isInitialRender || itemsTillEnd === 0
		);

		await component.setProps({
			shouldPerformDataRender,
			chunkSize
		});

		await component.withDefaultPaginationProviderProps({chunkSize});
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
