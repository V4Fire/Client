/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * @file This file contains test cases that verify the correctness of the component state during event emission.
 */

import test from 'tests/config/unit/test';

import { createTestHelpers, filterEmitterResults } from 'components/base/b-virtual-scroll/test/api/helpers';
import type { VirtualScrollTestHelpers } from 'components/base/b-virtual-scroll/test/api/helpers/interface';

test.describe('<b-virtual-scroll>', () => {
	let
		component: VirtualScrollTestHelpers['component'],
		provider: VirtualScrollTestHelpers['provider'],
		state: VirtualScrollTestHelpers['state'];

	const observerInitialStateFields = {
		itemsTillEnd: undefined,
		childTillEnd: undefined,
		maxViewedChild: undefined,
		maxViewedItem: undefined
	};

	const observerLoadedStateFields = {
		maxViewedChild: undefined,
		maxViewedItem: undefined
	};

	test.beforeEach(async ({demoPage, page}) => {
		await demoPage.goto();

		({component, provider, state} = await createTestHelpers(page));
		await provider.start();
	});

	test.describe('All data has been loaded after the initial load', () => {
		test('State at the time of emitting events must be correct', async () => {
			const chunkSize = 12;

			const states = [
				state.compile(observerInitialStateFields),
				(
					state.data.addData(chunkSize),
					state.set({loadPage: 1, isRequestsStopped: true}).compile(observerInitialStateFields)
				),
				(
					state.data.addItems(chunkSize),
					state.set({isInitialRender: false, renderPage: 1}).compile(observerLoadedStateFields)
				),
				(
					state.compile(observerLoadedStateFields)
				),
				(
					state.set({isLifecycleDone: true}).compile()
				)
			];

			provider
				.responseOnce(200, {data: state.data.getDataChunk(0)})
				.response(200, {data: []});

			await component
				.withDefaultPaginationProviderProps({chunkSize})
				.withProps({
					chunkSize,
					shouldStopRequestingData: () => true,
					'@hook:beforeDataCreate': (ctx) => {
						const original = ctx.emit;

						ctx.emit = jestMock.mock((...args) => {
							original(...args);
							return [args[0], Object.fastClone(ctx.getComponentState())];
						});
					}
				})
				.build();

			await component.waitForLifecycleDone();

			const
				spy = await component.getSpy((ctx) => ctx.emit),
				results = filterEmitterResults(await spy.results, true, ['initLoadStart', 'initLoad']);

			test.expect(results).toEqual([
				['initLoadStart', {...states[0], isLoadingInProgress: true}],
				['dataLoadStart', {...states[0], isLoadingInProgress: true}],
				['convertDataToDB', {...states[0], lastLoadedRawData: states[1].lastLoadedRawData}],
				['initLoad', {...states[0], lastLoadedRawData: states[1].lastLoadedRawData}],
				['dataLoadSuccess', states[1]],
				['renderStart', states[1]],
				['renderEngineStart', states[1]],
				['renderEngineDone', states[1]],
				['domInsertStart', states[2]],
				['domInsertDone', states[3]],
				['renderDone', states[3]],
				['lifecycleDone', states[4]]
			]);
		});
	});

	test.describe('All data has been loaded after the second load and reload was called', () => {
		test('State at the time of emitting events must be correct', async () => {
			const
				chunkSize = 12,
				providerChunkSize = chunkSize / 2;

			const states = [
				state.compile(observerInitialStateFields),
				(
					state.data.addData(providerChunkSize),
					state.set({loadPage: 1}).compile(observerInitialStateFields)
				),
				(
					state.data.addData(providerChunkSize),
					state.set({loadPage: 2, isInitialLoading: false}).compile(observerInitialStateFields)
				),
				(
					state.data.addItems(chunkSize),
					state.set({renderPage: 1, isInitialRender: false}).compile(observerLoadedStateFields)
				),
				(
					state.compile(observerLoadedStateFields)
				),
				(
					state.compile()
				),
				(
					state.data.addData(0),
					state.set({loadPage: 3, isRequestsStopped: true, isLastEmpty: true}).compile()
				),
				(
					state.set({isLifecycleDone: true}).compile()
				)
			];

			provider
				.responseOnce(200, {data: state.data.getDataChunk(0)})
				.responseOnce(200, {data: state.data.getDataChunk(1)})
				.responseOnce(200, {data: state.data.getDataChunk(2)})
				.responseOnce(200, {data: state.data.getDataChunk(0)})
				.responseOnce(200, {data: state.data.getDataChunk(1)})
				.response(200, {data: state.data.getDataChunk(2)});

			await component
				.withDefaultPaginationProviderProps({chunkSize: providerChunkSize})
				.withProps({
					chunkSize,
					'@hook:beforeDataCreate': (ctx) => {
						const original = ctx.emit;

						ctx.emit = jestMock.mock((...args) => {
							original(...args);
							return [args[0], Object.fastClone(ctx.getComponentState())];
						});
					}
				})
				.build();

			await component.waitForLifecycleDone();
			await component.reload();
			await component.waitForLifecycleDone();

			const
				spy = await component.getSpy((ctx) => ctx.emit),
				results = filterEmitterResults(await spy.results, true, ['initLoadStart', 'initLoad']);

			test.expect(results).toEqual([
				['initLoadStart', {...states[0], isLoadingInProgress: true}],
				['dataLoadStart', {...states[0], isLoadingInProgress: true}],
				['convertDataToDB', {...states[0], lastLoadedRawData: states[1].lastLoadedRawData}],
				['initLoad', {...states[0], lastLoadedRawData: states[1].lastLoadedRawData}],
				['dataLoadSuccess', states[1]],
				['dataLoadStart', states[1]],
				['convertDataToDB', {...states[1], lastLoadedRawData: states[2].lastLoadedRawData}],
				['dataLoadSuccess', states[2]],
				['renderStart', states[2]],
				['renderEngineStart', states[2]],
				['renderEngineDone', states[2]],
				['domInsertStart', states[3]],
				['domInsertDone', states[4]],
				['renderDone', states[4]],
				['dataLoadStart', states[5]],
				['convertDataToDB', {...states[5], lastLoadedRawData: states[6].lastLoadedRawData}],
				['dataLoadSuccess', states[6]],
				['lifecycleDone', states[7]],
				['resetState', states[0]],
				['initLoadStart', {...states[0], isLoadingInProgress: true}],
				['dataLoadStart', {...states[0], isLoadingInProgress: true}],
				['convertDataToDB', {...states[0], lastLoadedRawData: states[1].lastLoadedRawData}],
				['initLoad', {...states[0], lastLoadedRawData: states[1].lastLoadedRawData}],
				['dataLoadSuccess', states[1]],
				['dataLoadStart', states[1]],
				['convertDataToDB', {...states[1], lastLoadedRawData: states[2].lastLoadedRawData}],
				['dataLoadSuccess', states[2]],
				['renderStart', states[2]],
				['renderEngineStart', states[2]],
				['renderEngineDone', states[2]],
				['domInsertStart', states[3]],
				['domInsertDone', states[4]],
				['renderDone', states[4]],
				['dataLoadStart', states[5]],
				['convertDataToDB', {...states[5], lastLoadedRawData: states[6].lastLoadedRawData}],
				['dataLoadSuccess', states[6]],
				['lifecycleDone', states[7]]
			]);
		});
	});
});
