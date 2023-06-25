/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * @file This file contains test cases for the `chunkSize` preset.
 */

import test from 'tests/config/unit/test';

import { createTestHelpers } from 'components/base/b-scrolly/test/api/helpers';
import type { ScrollyTestHelpers } from 'components/base/b-scrolly/test/api/helpers/interface';
import type { ComponentState } from 'components/base/b-scrolly/interface';

test.describe('<b-scrolly> `chunkSize` preset', () => {
	let
		component: ScrollyTestHelpers['component'],
		provider: ScrollyTestHelpers['provider'],
		state: ScrollyTestHelpers['state'];

	test.beforeEach(async ({demoPage, page}) => {
		await demoPage.goto();

		({component, provider, state} = await createTestHelpers(page));
		await provider.start();

		await page.setViewportSize({height: 640, width: 360});
	});

	test.describe('With a different chunk size for each render cycle', () => {
		test('Should render 6 components first, then 12, then 18', async () => {
			const chunkSize = [6, 12, 18];

			provider
				.responseOnce(200, {data: state.data.addData(chunkSize[0])})
				.responseOnce(200, {data: state.data.addData(chunkSize[1])})
				.responseOnce(200, {data: state.data.addData(chunkSize[2])})
				.response(200, {data: []});

			await component.setProps({
				chunkSize: (state: ComponentState) => [6, 12, 18][state.renderPage] ?? 18,
				shouldPerformDataRender: ({isInitialRender, itemsTillEnd}) => <boolean>isInitialRender || itemsTillEnd === 0
			});

			await component.withDefaultPaginationProviderProps();
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
