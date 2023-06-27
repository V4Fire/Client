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

import { createTestHelpers } from 'components/base/b-scrolly/test/api/helpers';
import type { ScrollyTestHelpers } from 'components/base/b-scrolly/test/api/helpers/interface';
import type { ComponentElement } from 'core/component';
import type bScrolly from 'components/base/b-scrolly/b-scrolly';

test.describe('<b-scrolly>', () => {
	let
		component: ScrollyTestHelpers['component'],
		provider: ScrollyTestHelpers['provider'],
		state: ScrollyTestHelpers['state'];

	test.beforeEach(async ({demoPage, page}) => {
		await demoPage.goto();

		({component, provider, state} = await createTestHelpers(page));
		await provider.start();

		await component.setChildren({
			renderNext: {
				type: 'div',
				attrs: {
					id: 'renderNext',
					'@click': () => (<ComponentElement<bScrolly>>document.querySelector('.b-scrolly')).component?.initLoad()
				}
			},

			retry: {
				type: 'div',
				attrs: {
					id: 'retry',
					'@click': () => (<ComponentElement<bScrolly>>document.querySelector('.b-scrolly')).component?.initLoad()
				}
			}
		});
	});

	test.describe('Загрузился и отрисовался первый чанк данных', () => {
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

		test('Должен загрузить и отрисовать следующий после вызова initLoad', async () => {
			await component.node.locator('#renderNext').click();

			test.expect(provider.mock.mock.calls.length).toBe(2);
			await test.expect(component.waitForDataIndexChild(chunkSize * 2 - 1)).resolves.toBeUndefined();
			await test.expect(component.waitForContainerChildCountEqualsTo(chunkSize * 2)).resolves.toBeUndefined();
		});

		test('Должен завершиться жизненный цикл компонента после того как все данные загружены', async () => {
			provider.response(200, {data: []});

			await component.node.locator('#renderNext').click();

			await test.expect(component.waitForLifecycleDone()).resolves.toBeUndefined();
			await test.expect(component.waitForSlotState('renderNext', false)).resolves.toBeUndefined();
			await test.expect(component.waitForDataIndexChild(chunkSize - 1)).resolves.toBeUndefined();
			await test.expect(component.waitForContainerChildCountEqualsTo(chunkSize)).resolves.toBeUndefined();
		});

		test.describe('Произошла ошибка загрузки второго чанка данных', () => {
			test.beforeEach(async () => {
				provider.responseOnce(500, {data: []});
				await component.node.locator('#renderNext').click();
			});

			test('Не должен отображать renderNext слот', async () => {
				await test.expect(component.waitForSlotState('renderNext', false)).resolves.toBeUndefined();
			});

			test('Должен отображать retry слот', async () => {
				await test.expect(component.waitForSlotState('retry', true)).resolves.toBeUndefined();
			});

			test.describe('Произошла перезагрузка данных', () => {
				test.beforeEach(async () => {
					await component.node.locator('#retry').click();
				});

				test('Должен отобразить загруженные данные', async () => {
					await test.expect(component.waitForDataIndexChild(chunkSize * 2 - 1)).resolves.toBeUndefined();
					await test.expect(component.waitForContainerChildCountEqualsTo(chunkSize * 2)).resolves.toBeUndefined();
				});

				test.describe('Закончились данные к отображению', () => {
					test.beforeEach(async () => {
						provider.response(200, {data: []});
						await component.node.locator('#renderNext').click();
					});

					test('Должен завершиться жизненный цикл компонента после того как все данные загружены', async () => {
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
