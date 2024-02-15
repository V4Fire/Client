/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * @file This file contains test cases to verify the functionality of reloading data after an error.
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
			retry: {
				type: 'div',
				attrs: {
					id: 'retry',
					'@click': () => (<ComponentElement<bVirtualScrollNew>>document.querySelector('.b-virtual-scroll-new')).component?.initLoadNext()
				}
			}
		});
	});

	test.describe('data loading error ocurred on initial loading', () => {
		test('should reload data after initLoad call', async () => {
			const chunkSize = 12;

			provider
				.responseOnce(500, {})
				.responseOnce(200, {data: state.data.addData(chunkSize)})
				.response(200, {data: []});

			await component
				.withProps({chunkSize})
				.withDefaultPaginationProviderProps({chunkSize})
				.build();

			await component.node.locator('#retry').click();

			await test.expect(component.waitForChildCountEqualsTo(chunkSize)).resolves.toBeUndefined();
		});

		test('should reload data after invoking retry function from `onRequestError` handler', async () => {
			const chunkSize = 12;

			provider
				.responseOnce(500, {})
				.responseOnce(200, {data: state.data.addData(chunkSize)})
				.response(200, {data: []});

			await component
				.withDefaultPaginationProviderProps({chunkSize})
				.withProps({
					chunkSize,
					'@onRequestError': (_, retryFn) => setTimeout(retryFn, 0)
				})
				.build();

			await test.expect(component.waitForChildCountEqualsTo(chunkSize)).resolves.toBeUndefined();
		});

		test('should goes to retry state after failing to load data twice', async () => {
			const chunkSize = 12;

			provider
				.responseOnce(500, {})
				.responseOnce(500, {})
				.responseOnce(200, {data: state.data.addData(chunkSize)})
				.response(200, {data: []});

			await component
				.withProps({chunkSize})
				.withDefaultPaginationProviderProps({chunkSize})
				.build();

			const event = component.waitForEvent('dataLoadError');
			await component.node.locator('#retry').click();
			await event;
			await component.node.locator('#retry').click();

			await test.expect(component.waitForChildCountEqualsTo(chunkSize)).resolves.toBeUndefined();
		});
	});

	test.describe('data loading error ocurred on second data chunk loading', () => {
		test('should reload second data chunk after initLoad call', async () => {
			const chunkSize = 12;

			provider
				.responseOnce(200, {data: state.data.addData(chunkSize)})
				.responseOnce(500, {})
				.responseOnce(200, {data: state.data.addData(chunkSize)})
				.response(200, {data: []});

			await component
				.withDefaultPaginationProviderProps({chunkSize})
				.withProps({chunkSize})
				.build();

			await component.waitForChildCountEqualsTo(chunkSize);
			await component.scrollToBottom();

			await component.node.locator('#retry').click();
			await component.waitForDataIndexChild(chunkSize * 2 - 1);

			await test.expect(component.waitForChildCountEqualsTo(chunkSize * 2)).resolves.toBeUndefined();
		});
	});

	test.describe('an error occurred while loading the second chunk of data for rendering the first chunk of elements', () => {
		test('should reload second data chunk and perform a render', async () => {
			const
				chunkSize = 12,
				providerChunkSize = chunkSize / 2;

			provider
				.responseOnce(200, {data: state.data.addData(providerChunkSize)})
				.responseOnce(500, {})
				.responseOnce(200, {data: state.data.addData(providerChunkSize)})
				.response(200, {data: []});

			await component
				.withDefaultPaginationProviderProps({chunkSize: providerChunkSize})
				.withProps({chunkSize})
				.build();

			await component.node.locator('#retry').click();

			await component.waitForChildCountEqualsTo(chunkSize);
			await component.waitForDataIndexChild(chunkSize - 1);
			await component.scrollToBottom();
			await component.waitForLifecycleDone();

			await test.expect(component.waitForChildCountEqualsTo(chunkSize)).resolves.toBeUndefined();
		});
	});

	test.describe('an error occurred while loading the last chunk of data', () => {
		test('after a successful load, the component lifecycle should complete', async () => {
			const chunkSize = 12;

			provider
				.responseOnce(200, {data: state.data.addData(chunkSize)})
				.responseOnce(500, {})
				.response(200, {data: []});

			await component
				.withProps({chunkSize})
				.withDefaultPaginationProviderProps({chunkSize})
				.build();

			await component.waitForChildCountEqualsTo(chunkSize);
			await component.scrollToBottom();
			await component.node.locator('#retry').click();

			test.expect(provider.mock.mock.calls.length).toBe(3);
			await test.expect(component.waitForLifecycleDone()).resolves.toBeUndefined();
			await test.expect(component.waitForChildCountEqualsTo(chunkSize)).resolves.toBeUndefined();
		});
	});
});
