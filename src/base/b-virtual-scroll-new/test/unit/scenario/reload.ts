/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * @file This file contains a set of test cases to verify the functionality of component reloading.
 */

import test from 'tests/config/unit/test';

import { createTestHelpers, filterEmitterCalls } from 'base/b-virtual-scroll-new/test/api/helpers';
import type { VirtualScrollTestHelpers } from 'base/b-virtual-scroll-new/test/api/helpers/interface';

test.describe('<b-virtual-scroll-new>', () => {
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
		test('Should reset state and reload the component data', async () => {
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
					'@componentHook:beforeDataCreate': (ctx) => jestMock.spy(ctx, 'emit')
				})
				.build({useDummy: true});

			await component.waitForChildCountEqualsTo(chunkSize[0]);

			await component.update({
				attrs: {
					request: {
						get: {
							chunkSize: chunkSize[1]
						}
					},
					chunkSize: chunkSize[1]
				}
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
			await test.expect(component.waitForChildCountEqualsTo(chunkSize[1])).resolves.toBeUndefined();
		});
	});

	['reset', 'reset.silence', 'reset.load', 'reset.load.silence'].forEach((event, i) => {
		test.describe(`${event} fired`, () => {
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
						'@componentHook:beforeDataCreate': (ctx) => jestMock.spy(ctx, 'emit')
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
				await test.expect(component.waitForChildCountEqualsTo(chunkSize)).resolves.toBeUndefined();
			});
		});
	});

});
