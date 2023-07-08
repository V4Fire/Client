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

import { createTestHelpers, filterEmitterCalls } from 'components/base/b-virtual-scroll/test/api/helpers';
import type { VirtualScrollTestHelpers } from 'components/base/b-virtual-scroll/test/api/helpers/interface';

test.describe('<b-virtual-scroll>', () => {
	let
		component: VirtualScrollTestHelpers['component'],
		provider: VirtualScrollTestHelpers['provider'],
		state: VirtualScrollTestHelpers['state'],
		initLoadSpy: VirtualScrollTestHelpers['initLoadSpy'];

	test.beforeEach(async ({demoPage, page}) => {
		await demoPage.goto();

		({component, provider, state, initLoadSpy} = await createTestHelpers(page));
		await provider.start();
	});

	test.describe('`request` prop was changed', () => {
		test('Should reset state and reload the component data', async ({demoPage}) => {
			const
				chunkSize = [12, 20];

			provider
				.responseOnce(200, {data: state.data.addData(chunkSize[0])})
				.responseOnce(200, {data: state.data.addData(chunkSize[1])})
				.response(200, {data: []});

			await component
				.withDefaultPaginationProviderProps({chunkSize: chunkSize[0]})
				.withProps({
					chunkSize: chunkSize[0],
					shouldPerformDataRequest: ({itemsTillEnd}) => itemsTillEnd === 0,
					'@hook:beforeDataCreate': (ctx) => jestMock.spy(ctx, 'emit')
				})
				.pick(demoPage.buildTestComponent(component.componentName, component.props));

			await component.waitForContainerChildCountEqualsTo(chunkSize[0]);

			await demoPage.updateTestComponent({
				request: {
					get: {
						chunkSize: chunkSize[1]
					}
				},
				chunkSize: chunkSize[1]
			});

			await component.waitForDataIndexChild(chunkSize[1] - 1);

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
				'resetState',
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

			await test.expect(initLoadSpy.calls).resolves.toEqual([[], []]);
			await test.expect(component.waitForContainerChildCountEqualsTo(chunkSize[1])).resolves.toBeUndefined();
		});
	});

	['reset', 'reset.silence', 'reset.load', 'reset.load.silence'].forEach((event, i) => {
		test.describe(`Случилось событие ${event}`, () => {
			test('Should reset state and reload the component data', async () => {
				const
					chunkSize = 12;

				provider
					.responseOnce(200, {data: state.data.addData(chunkSize)})
					.responseOnce(200, {data: state.data.addData(chunkSize)})
					.response(200, {data: []});

				await component
					.withDefaultPaginationProviderProps({chunkSize})
					.withProps({
						chunkSize,
						shouldPerformDataRequest: ({itemsTillEnd}) => itemsTillEnd === 0,
						'@hook:beforeDataCreate': (ctx) => jestMock.spy(ctx, 'emit')
					})
					.build();

				await component.waitForDataIndexChild(chunkSize - 1);
				await component.component.evaluate((ctx, [event]) => ctx.unsafe.globalEmitter.emit(event), [event]);
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
					'resetState',
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

				const initLoadArgs = [
					[[], []],
					[[], [undefined, {silent: true}]],
					[[], []],
					[[], [undefined, {silent: true}]]
				];

				await test.expect(initLoadSpy.calls).resolves.toEqual(initLoadArgs[i]);
				await test.expect(component.waitForContainerChildCountEqualsTo(chunkSize)).resolves.toBeUndefined();
			});
		});
	});

});

// * `reset` - reloads all data providers (including the tied storage and router);
// * `reset.silence` - reloads all data providers (including the tied storage and router) in silent mode;
// * `reset.load` - reloads the tied data providers;
// * `reset.load.silence` - reloads the tied data providers in silent mode;
