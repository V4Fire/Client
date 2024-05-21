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

import type { ComponentElement } from 'core/component';

import type bVirtualScrollNew from 'components/base/b-virtual-scroll-new/b-virtual-scroll-new';
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

		await component.withChildren({
			renderNext: {
				type: 'div',
				attrs: {
					id: 'renderNext',
					'@click': () => (<ComponentElement<bVirtualScrollNew>>document.querySelector('.b-virtual-scroll-new')).component?.initLoadNext()
				}
			},

			retry: {
				type: 'div',
				attrs: {
					id: 'retry',
					'@click': () => (<ComponentElement<bVirtualScrollNew>>document.querySelector('.b-virtual-scroll-new')).component?.initLoadNext()
				}
			}
		});
	});

	test.describe('the first chunk of data is loaded and rendered', () => {
		const chunkSize = 12;

		test.beforeEach(async () => {
			provider.response(200, () => ({data: state.data.addData(chunkSize)}));

			await component
				.withDefaultPaginationProviderProps({chunkSize})
				.withProps({
					chunkSize,
					disableObserver: true,
					shouldPerformDataRender: () => true
				})
				.build();

			await component.waitForChildCountEqualsTo(chunkSize);
		});

		test('should load and render the next chunk after calling initLoadNext', async () => {
			await component.node.locator('#renderNext').click();

			test.expect(provider.mock.mock.calls.length).toBe(2);
			await test.expect(component.waitForDataIndexChild(chunkSize * 2 - 1)).resolves.toBeUndefined();
			await test.expect(component.waitForChildCountEqualsTo(chunkSize * 2)).resolves.toBeUndefined();
		});

		test('should complete the component lifecycle after all data is loaded', async () => {
			provider.response(200, {data: []});

			await component.node.locator('#renderNext').click();

			await test.expect(component.waitForLifecycleDone()).resolves.toBeUndefined();
			await test.expect(component.waitForSlotState('renderNext', false)).resolves.toBeUndefined();
			await test.expect(component.waitForDataIndexChild(chunkSize - 1)).resolves.toBeUndefined();
			await test.expect(component.waitForChildCountEqualsTo(chunkSize)).resolves.toBeUndefined();
		});

		test.describe('an error occurred while loading the second chunk of data', () => {
			test.beforeEach(async () => {
				provider.responseOnce(500, {data: []});
				await component.node.locator('#renderNext').click();
			});

			test('should not display the renderNext slot', async () => {
				await test.expect(component.waitForSlotState('renderNext', false)).resolves.toBeUndefined();
			});

			test('should display the retry slot', async () => {
				await test.expect(component.waitForSlotState('retry', true)).resolves.toBeUndefined();
			});

			test.describe('data reload occurred', () => {
				test.beforeEach(async () => {
					await component.node.locator('#retry').click();
				});

				test('should display the loaded data', async () => {
					await test.expect(component.waitForDataIndexChild(chunkSize * 2 - 1)).resolves.toBeUndefined();
					await test.expect(component.waitForChildCountEqualsTo(chunkSize * 2)).resolves.toBeUndefined();
				});

				test.describe('no more data to display', () => {
					test.beforeEach(async () => {
						provider.response(200, {data: []});
						await component.node.locator('#renderNext').click();
					});

					test('should complete the component lifecycle after all data is loaded', async () => {
						await test.expect(component.waitForLifecycleDone()).resolves.toBeUndefined();
						await test.expect(component.waitForSlotState('renderNext', false)).resolves.toBeUndefined();
						await test.expect(component.waitForDataIndexChild(chunkSize * 2 - 1)).resolves.toBeUndefined();
						await test.expect(component.waitForChildCountEqualsTo(chunkSize * 2)).resolves.toBeUndefined();
					});
				});
			});
		});
	});
});
