/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * @file Этот файл содержит тест кейсы для проверки функциональности изменения пропов компонентов.
 */

import test from 'tests/config/unit/test';

import { createTestHelpers, filterEmitterCalls } from 'components/base/b-scrolly/test/api/helpers';
import type { ScrollyTestHelpers } from 'components/base/b-scrolly/test/api/helpers/interface';

test.describe('<b-scrolly>', () => {
	let
		component: ScrollyTestHelpers['component'],
		provider: ScrollyTestHelpers['provider'],
		state: ScrollyTestHelpers['state'],
		initLoadSpy: ScrollyTestHelpers['initLoadSpy'];

	test.beforeEach(async ({demoPage, page}) => {
		await demoPage.goto();

		({component, provider, state, initLoadSpy} = await createTestHelpers(page));
		await provider.start();
	});

	test.skip('`chunkSize` prop changes after the first chunk has been rendered', () => {
		test('Should render the second chunk with the new chunk size', async () => {
			const
				chunkSize = 12;

			provider.response(200, () => ({data: state.data.addData(chunkSize)}));

			await component.setProps({
				chunkSize,
				shouldPerformDataRender: ({isInitialRender, itemsTIllEnd}) => <boolean>isInitialRender || itemsTIllEnd === 0
			});

			await component.withDefaultPaginationProviderProps({chunkSize});
			await component.build();
			await component.waitForContainerChildCountEqualsTo(chunkSize);

			await component.setProps({
				chunkSize: chunkSize * 2
			});

			await component.scrollToBottom();

			test.expect(provider.mock.mock.calls.length).toBe(3);
			await test.expect(component.waitForContainerChildCountEqualsTo(chunkSize * 3)).resolves.toBeUndefined();
		});
	});

	test.skip('`request` prop was changed', () => {
		test('Should reload the component data', async () => {
			const
				chunkSize = 12;

			provider
				.responseOnce(200, {data: state.data.addData(chunkSize)})
				.responseOnce(200, {data: state.data.addData(chunkSize)})
				.response(200, {data: []});

			await component.setProps({
				chunkSize,
				shouldPerformDataRender: ({isInitialRender, itemsTIllEnd}) => <boolean>isInitialRender || itemsTIllEnd === 0,
				'@hook:beforeDataCreate': (ctx) => jestMock.spy(ctx, 'emit')
			});

			await component.withDefaultPaginationProviderProps({chunkSize});
			await component.build();
			await component.waitForContainerChildCountEqualsTo(chunkSize);

			await component.setProps({
				get: {
					chunkSize: 20
				}
			});

			await component.waitForDataIndexChild(chunkSize * 2 - 1);

			const
				spy = await component.getSpy((ctx) => ctx.emit),
				calls = filterEmitterCalls(await spy.calls, true, ['initLoadStart', 'initLoad']).map(([event]) => event);

			test.expect(calls).toEqual([
				'initLoadStart',
				'dataLoadStart',
				'convertDataToDB',
				'initLoad',
				'dataLoadSuccess',
				'renderStart',
				'renderEngineStart',
				'renderEngineDone',
				'domInsertStart',
				'domInsertDone',
				'renderDone',
				'initLoadStart',
				'dataLoadStart',
				'convertDataToDB',
				'initLoad',
				'dataLoadSuccess',
				'renderStart',
				'renderEngineStart',
				'renderEngineDone',
				'domInsertStart',
				'domInsertDone',
				'renderDone'
			]);

			await test.expect(initLoadSpy.calls).resolves.toBe([[], []]);
			await test.expect(component.waitForContainerChildCountEqualsTo(chunkSize)).resolves.toBeTruthy();
		});
	});

	test.skip('`requestQuery` prop was changed', () => {
		test('Should not reload the entire component', async () => {
			// ...
		});

		test('Should request the second chunk with the new parameters', async () => {
			// ...
		});
	});
});
