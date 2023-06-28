/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * @file This file contains test cases for verifying the functionality of loading data
 * using methods instead of observers.
 */

import test from 'tests/config/unit/test';

import { createTestHelpers } from 'components/base/b-virtual-scroll/test/api/helpers';
import type { VirtualScrollTestHelpers } from 'components/base/b-virtual-scroll/test/api/helpers/interface';
import type { ComponentElement } from 'core/component';
import type bVirtualScroll from 'components/base/b-virtual-scroll/b-virtual-scroll';

test.describe('<b-virtual-scroll>', () => {
	let
		component: VirtualScrollTestHelpers['component'],
		provider: VirtualScrollTestHelpers['provider'],
		state: VirtualScrollTestHelpers['state'];

	test.beforeEach(async ({demoPage, page}) => {
		await demoPage.goto();

		({component, provider, state} = await createTestHelpers(page));
		await provider.start();

		await component.setChildren({
			renderNext: {
				type: 'div',
				attrs: {
					id: 'renderNext',
					'@click': () => (<ComponentElement<bVirtualScroll>>document.querySelector('.b-virtual-scroll')).component?.initLoad()
				}
			},

			retry: {
				type: 'div',
				attrs: {
					id: 'retry',
					'@click': () => (<ComponentElement<bVirtualScroll>>document.querySelector('.b-virtual-scroll')).component?.initLoad()
				}
			}
		});
	});

	test.describe('The first chunk of data is loaded and rendered', () => {
		const chunkSize = 12;

		test.beforeEach(async () => {
			provider.response(200, () => ({data: state.data.addData(chunkSize)}));

			await component.setProps({
				chunkSize,
				disableObserver: true,
				shouldPerformDataRender: () => true
			});

			await component.withDefaultPaginationProviderProps({chunkSize});
			await component.build();
			await component.waitForContainerChildCountEqualsTo(chunkSize);
		});

		test('Should load and render the next chunk after calling initLoad', async () => {
			await component.node.locator('#renderNext').click();

			test.expect(provider.mock.mock.calls.length).toBe(2);
			await test.expect(component.waitForDataIndexChild(chunkSize * 2 - 1)).resolves.toBeUndefined();
			await test.expect(component.waitForContainerChildCountEqualsTo(chunkSize * 2)).resolves.toBeUndefined();
		});

		test('Should complete the component lifecycle after all data is loaded', async () => {
			provider.response(200, {data: []});

			await component.node.locator('#renderNext').click();

			await test.expect(component.waitForLifecycleDone()).resolves.toBeUndefined();
			await test.expect(component.waitForSlotState('renderNext', false)).resolves.toBeUndefined();
			await test.expect(component.waitForDataIndexChild(chunkSize - 1)).resolves.toBeUndefined();
			await test.expect(component.waitForContainerChildCountEqualsTo(chunkSize)).resolves.toBeUndefined();
		});

		test.describe('An error occurred while loading the second chunk of data', () => {
			test.beforeEach(async () => {
				provider.responseOnce(500, {data: []});
				await component.node.locator('#renderNext').click();
			});

			test('Should not display the renderNext slot', async () => {
				await test.expect(component.waitForSlotState('renderNext', false)).resolves.toBeUndefined();
			});

			test('Should display the retry slot', async () => {
				await test.expect(component.waitForSlotState('retry', true)).resolves.toBeUndefined();
			});

			test.describe('Data reload occurred', () => {
				test.beforeEach(async () => {
					await component.node.locator('#retry').click();
				});

				test('Should display the loaded data', async () => {
					await test.expect(component.waitForDataIndexChild(chunkSize * 2 - 1)).resolves.toBeUndefined();
					await test.expect(component.waitForContainerChildCountEqualsTo(chunkSize * 2)).resolves.toBeUndefined();
				});

				test.describe('No more data to display', () => {
					test.beforeEach(async () => {
						provider.response(200, {data: []});
						await component.node.locator('#renderNext').click();
					});

					test('Should complete the component lifecycle after all data is loaded', async () => {
						await test.expect(component.waitForLifecycleDone()).resolves.toBeUndefined();
						await test.expect(component.waitForSlotState('renderNext', false)).resolves.toBeUndefined();
						await test.expect(component.waitForDataIndexChild(chunkSize * 2 - 1)).resolves.toBeUndefined();
						await test.expect(component.waitForContainerChildCountEqualsTo(chunkSize * 2)).resolves.toBeUndefined();
					});
				});
			});
		});
	});
});
