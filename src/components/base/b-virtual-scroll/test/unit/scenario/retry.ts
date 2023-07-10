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

		await component.setChildren({
			retry: {
				type: 'div',
				attrs: {
					id: 'retry',
					'@click': () => (<ComponentElement<bVirtualScroll>>document.querySelector('.b-virtual-scroll')).component?.initLoadNext()
				}
			}
		});
	});

	test.describe('Data loading error ocurred on initial loading', () => {
		test('Should reload data after initLoad call', async () => {
			const chunkSize = 12;

			provider
				.responseOnce(500, {})
				.responseOnce(200, {data: state.data.addData(chunkSize)})
				.response(200, {data: []});

			await component.withProps({chunkSize});
			await component.withDefaultPaginationProviderProps({chunkSize});
			await component.build();

			await component.node.locator('#retry').click();

			await test.expect(component.waitForContainerChildCountEqualsTo(chunkSize)).resolves.toBeUndefined();
		});

		test('Should reload data after invoking retry function from `onRequestError` handler', async () => {
			const chunkSize = 12;

			provider
				.responseOnce(500, {})
				.responseOnce(200, {data: state.data.addData(chunkSize)})
				.response(200, {data: []});

			await component.withProps({
				chunkSize,
				'@onRequestError': (_, retryFn) => setTimeout(retryFn, 0)
			});

			await component.withDefaultPaginationProviderProps({chunkSize});
			await component.build();

			await test.expect(component.waitForContainerChildCountEqualsTo(chunkSize)).resolves.toBeUndefined();
		});

		test('Should goes to retry state after failing to load data twice', async () => {
			const chunkSize = 12;

			provider
				.responseOnce(500, {})
				.responseOnce(500, {})
				.responseOnce(200, {data: state.data.addData(chunkSize)})
				.response(200, {data: []});

			await component.withProps({chunkSize});
			await component.withDefaultPaginationProviderProps({chunkSize});
			await component.build();

			const event = component.waitForEvent('dataLoadError');
			await component.node.locator('#retry').click();
			await event;
			await component.node.locator('#retry').click();

			await test.expect(component.waitForContainerChildCountEqualsTo(chunkSize)).resolves.toBeUndefined();
		});
	});

	test.describe('Data loading error ocurred on second data chunk loading', () => {
		test('Should reload second data chunk after initLoad call', async () => {
			const chunkSize = 12;

			provider
				.responseOnce(200, {data: state.data.addData(chunkSize)})
				.responseOnce(500, {})
				.responseOnce(200, {data: state.data.addData(chunkSize)})
				.response(200, {data: []});

			await component
				.withDefaultPaginationProviderProps({chunkSize})
				.withProps({chunkSize});

			await component.build();
			await component.waitForContainerChildCountEqualsTo(chunkSize);
			await component.scrollToBottom();

			await component.node.locator('#retry').click();
			await component.waitForDataIndexChild(chunkSize * 2 - 1);

			await test.expect(component.waitForContainerChildCountEqualsTo(chunkSize * 2)).resolves.toBeUndefined();
		});
	});

	test.describe('An error occurred while loading the second chunk of data for rendering the first chunk of elements', () => {
		test('Should reload second data chunk and perform a render', async () => {
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
				.withProps({chunkSize});

			await component.build();
			await component.node.locator('#retry').click();

			await component.waitForContainerChildCountEqualsTo(chunkSize);
			await component.waitForDataIndexChild(chunkSize - 1);
			await component.waitForLifecycleDone();

			await test.expect(component.waitForContainerChildCountEqualsTo(chunkSize)).resolves.toBeUndefined();
		});
	});

	test.describe('An error occurred while loading the last chunk of data', () => {
		test('After a successful load, the component lifecycle should complete', async () => {
			const chunkSize = 12;

			provider
				.responseOnce(200, {data: state.data.addData(chunkSize)})
				.responseOnce(500, {})
				.response(200, {data: []});

			await component.withProps({chunkSize});
			await component.withDefaultPaginationProviderProps({chunkSize});
			await component.build();

			await component.node.locator('#retry').click();

			test.expect(provider.mock.mock.calls.length).toBe(3);
			await test.expect(component.waitForLifecycleDone()).resolves.toBeUndefined();
			await test.expect(component.waitForContainerChildCountEqualsTo(chunkSize)).resolves.toBeUndefined();
		});
	});
});
