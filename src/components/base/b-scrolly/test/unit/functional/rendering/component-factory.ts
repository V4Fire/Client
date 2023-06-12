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
import type { ComponentItemFactory } from 'components/base/b-scrolly/b-scrolly';
import type { ComponentItem } from 'components/base/b-scrolly/interface';

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

	test.skip('Returned items with type `item` is equal to the provided data', async () => {
		const
			chunkSize = 12;

		provider
			.responseOnce(200, {data: state.data.addData(chunkSize)})
			.response(200, {data: state.data.addData(0)});

		const itemsFactory = await component.mockFn<ComponentItemFactory<{i: number}>>((ctx, data) =>
			data.map((value) => <ComponentItem>({
				item: 'section',
				key: '',
				type: 'item',
				children: [],
				props: {
					'data-index': value.i
				}
			})));

		await component.setProps({
			itemsFactory,
			shouldPerformDataRender: () => true,
			chunkSize
		});

		await component.withDefaultPaginationProviderProps({chunkSize});
		await component.build();

		await test.expect(component.waitForContainerChildCountEqualsTo(chunkSize)).resolves.toBeUndefined();

	});

	test.skip('In additional `item`, `separator` was also returned', async () => {
		const
			chunkSize = 12;

		provider
			.responseOnce(200, {data: state.data.addData(chunkSize)})
			.response(200, {data: state.data.addData(0)});

		const itemsFactory = await component.mockFn<ComponentItemFactory<{i: number}>>((ctx, data) => {
			const result = data.map((value) => <ComponentItem>({
				item: 'section',
				key: '',
				type: 'item',
				children: [],
				props: {
					'data-index': value.i
				}
			}));

			result.push({
				item: 'b-button',
				key: '',
				children: {
					default: {
						type: 'div',
						attrs: {
							id: 'button'
						}
					}
				},
				type: 'separator'
			});

			return result;
		});

		await component.setProps({
			itemsFactory,
			shouldPerformDataRender: () => true,
			chunkSize
		});

		await component.withDefaultPaginationProviderProps({chunkSize});
		await component.build();

		await test.expect(component.waitForContainerChildCountEqualsTo(chunkSize + 1)).resolves.toBeUndefined();
	});

	test.skip('Returned items with type `item` is less than the provided data', async () => {
		// Ошибка
	});

	test.skip('Returned item with type `item` is more than the provided data', async () => {
		// Выкидывает ошибку
	});

	test.skip('`item` was not returned, but equal to the number of data, the number of `separator` was returned', async () => {
		// Выкидывает ошибку
	});
});
