/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/* eslint-disable max-lines-per-function */

/**
 * @file This file contains test cases that verify the correctness of the component state during event emission.
 */

import test from 'tests/config/unit/test';

import { createTestHelpers, filterEmitterResults } from 'components/base/b-virtual-scroll-new/test/api/helpers';
import type { VirtualScrollTestHelpers } from 'components/base/b-virtual-scroll-new/test/api/helpers/interface';
import type { VirtualScrollState } from 'components/base/b-virtual-scroll-new/interface';
import { BOM } from 'tests/helpers';

test.describe('<b-virtual-scroll-new>', () => {
	let
		component: VirtualScrollTestHelpers['component'],
		provider: VirtualScrollTestHelpers['provider'],
		state: VirtualScrollTestHelpers['state'];

	const observerInitialStateFields = {
		remainingItems: undefined,
		remainingChildren: undefined,
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

	test.describe('all data has been loaded after the initial load', () => {
		test('state at the time of emitting events must be correct', async () => {
			const chunkSize = 12;

			const states = [
				state.compile(observerInitialStateFields),
				(
					state.data.addData(chunkSize),
					state.set({loadPage: 1, areRequestsStopped: true}).compile(observerInitialStateFields)
				),
				(
					state.set({isLastRender: true}).compile(observerInitialStateFields)
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
							return [args[0], Object.fastClone(ctx.getVirtualScrollState())];
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
				['renderStart', states[2]],
				['renderEngineStart', states[2]],
				['renderEngineDone', states[2]],
				['domInsertStart', states[3]],
				['domInsertDone', states[4]],
				['renderDone', states[4]],
				['lifecycleDone', states[5]]
			]);
		});
	});

	test.describe('all data has been loaded after the second load and reload was called', () => {
		test('state at the time of emitting events must be correct', async ({page}) => {
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
					state.set({loadPage: 3, areRequestsStopped: true, isLastEmpty: true}).compile()
				),
				(
					state.set({isLastRender: true}).compile()
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
							return [args[0], Object.fastClone(ctx.getVirtualScrollState())];
						});
					}
				})
				.build();

			await component.waitForChildCountEqualsTo(chunkSize);
			await component.scrollToBottom();
			await component.waitForLifecycleDone();
			await component.reload();
			await BOM.waitForIdleCallback(page);
			await component.container.waitFor({state: 'visible'});
			await component.waitForChildCountEqualsTo(chunkSize);
			await component.scrollToBottom();
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
				['renderStart', states[7]],
				['renderDone', states[7]],
				['lifecycleDone', states[8]],
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
				['renderStart', states[7]],
				['renderDone', states[7]],
				['lifecycleDone', states[8]]
			]);
		});
	});

	test.describe('all data has been loaded after few scrolls', () => {
		test('state at the time of emitting events must be correct', async () => {
			const
				chunkSize = 12,
				providerChunkSize = chunkSize,
				total = chunkSize * 2;

			state.data.setTotal(total);

			const states = [
				state.compile(observerInitialStateFields),
				(
					// 1
					state.data.addData(providerChunkSize),
					state.set({loadPage: 1}).compile(observerInitialStateFields)
				),
				(
					// 2
					state.data.addItems(chunkSize),
					state.set({renderPage: 1, isInitialRender: false}).compile(observerLoadedStateFields)
				),
				(
					// 3
					state.compile()
				),
				(
					// 4
					state.data.addData(providerChunkSize),
					state.set({
						loadPage: 2,
						areRequestsStopped: true,
						isLastEmpty: false,
						isInitialLoading: false
					}).compile()
				),
				(
					// 5
					state.set({isLastRender: true}).compile()
				),
				(
					// 6
					state.data.addItems(chunkSize),
					state.set({renderPage: 2}).compile()
				),
				(
					// 7
					state.set({isLifecycleDone: true}).compile()
				)
			];

			provider
				.responseOnce(200, {data: state.data.getDataChunk(0), total})
				.responseOnce(200, {data: state.data.getDataChunk(1), total});

			await component
				.withDefaultPaginationProviderProps({chunkSize: providerChunkSize})
				.withProps({
					chunkSize,
					shouldStopRequestingData: (state: VirtualScrollState): boolean =>
						Object.get(state, 'lastLoadedRawData.total') === state.data.length,

					'@hook:beforeDataCreate': (ctx) => {
						const original = ctx.emit;

						ctx.emit = jestMock.mock((...args) => {
							original(...args);
							return [args[0], Object.fastClone(ctx.getVirtualScrollState())];
						});
					}
				})
				.build();

			await component.waitForChildCountEqualsTo(chunkSize);
			await component.scrollToBottom();
			await component.waitForChildCountEqualsTo(chunkSize * 2);
			await component.scrollToBottom();
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
				['domInsertDone', states[2]],
				['renderDone', states[2]],
				['dataLoadStart', {...states[3], isLoadingInProgress: true}],
				['convertDataToDB', {...states[3], lastLoadedRawData: states[4].lastLoadedRawData}],
				['dataLoadSuccess', states[4]],
				['renderStart', states[5]],
				['renderEngineStart', states[5]],
				['renderEngineDone', states[5]],
				['domInsertStart', states[6]],
				['domInsertDone', states[6]],
				['renderDone', states[6]],
				['lifecycleDone', states[7]]
			]);
		});
	});

	test.describe('24 elements was provided in items prop', () => {
		test('state at the time of emitting events must be correct', async () => {
			const
				chunkSize = 12,
				total = chunkSize * 2;

			const states = [
				state.compile(observerInitialStateFields),
				(
					state.data.addData(chunkSize * 2),
					state.data.setTotal(total),

					state.set({
						loadPage: 1,
						lastLoadedRawData: undefined,
						areRequestsStopped: true
					}).compile(observerInitialStateFields)
				),
				(
					state.data.addItems(chunkSize),
					state.set({renderPage: 1, isInitialRender: false}).compile(observerLoadedStateFields)
				),
				(
					state.set({isLastRender: true}).compile()
				),
				(
					state.data.addItems(chunkSize),
					state.set({renderPage: 2}).compile()
				),
				(
					state.set({isLifecycleDone: true}).compile()
				)
			];

			await component
				.withPaginationItemProps()
				.withProps({
					chunkSize,
					items: state.data.getDataChunk(0),

					'@hook:beforeDataCreate': (ctx) => {
						const original = ctx.emit;

						ctx.emit = jestMock.mock((...args) => {
							original(...args);
							return [args[0], Object.fastClone(ctx.getVirtualScrollState())];
						});
					}
				})
				.build();

			await component.waitForChildCountEqualsTo(chunkSize);
			await component.scrollToBottom();
			await component.waitForChildCountEqualsTo(chunkSize * 2);
			await component.scrollToBottom();
			await component.waitForLifecycleDone();

			const
				spy = await component.getSpy((ctx) => ctx.emit),
				results = filterEmitterResults(await spy.results, true, ['initLoadStart', 'initLoad']);

			test.expect(results).toEqual([
				['initLoadStart', {...states[0], isLoadingInProgress: true}],
				['initLoad', {...states[0], isLoadingInProgress: true}],
				['dataLoadSuccess', states[1]],
				['renderStart', states[1]],
				['renderEngineStart', states[1]],
				['renderEngineDone', states[1]],
				['domInsertStart', states[2]],
				['domInsertDone', states[2]],
				['renderDone', states[2]],
				['renderStart', states[3]],
				['renderEngineStart', states[3]],
				['renderEngineDone', states[3]],
				['domInsertStart', states[4]],
				['domInsertDone', states[4]],
				['renderDone', states[4]],
				['lifecycleDone', states[5]]
			]);
		});
	});

	test.describe('24 elements was provided in items prop', () => {
		const
			chunkSize = 12,
			total = chunkSize * 2;

		test.beforeEach(async () => {
			state.data.addData(chunkSize * 2);
			state.data.setTotal(total);

			await component
				.withPaginationItemProps()
				.withProps({
					chunkSize,
					items: state.data.getDataChunk(0)
				})
				.build({useDummy: true});

			await component.waitForChildCountEqualsTo(chunkSize);
			await component.scrollToBottom();
			await component.waitForChildCountEqualsTo(chunkSize * 2);
			await component.scrollToBottom();
			await component.waitForLifecycleDone();
		});

		test.describe('items prop has been updated', () => {
			test('state at the time of emitting events must be correct', async () => {
				state.reset();

				await component.evaluate((ctx) => {
					const original = Object.cast<Function>(ctx.emit);

					ctx.emit = jestMock.mock((...args) => {
						original(...args);
						return [args[0], Object.fastClone(ctx.getVirtualScrollState())];
					});
				});

				const states = [
					state.compile(observerInitialStateFields),
					(
						state.data.addData(chunkSize * 2),
						state.data.setTotal(total),

						state.set({
							loadPage: 1,
							lastLoadedRawData: undefined,
							areRequestsStopped: true
						}).compile(observerInitialStateFields)
					),
					(
						state.data.addItems(chunkSize),
						state.set({renderPage: 1, isInitialRender: false}).compile(observerLoadedStateFields)
					),
					(
						state.set({isLastRender: true}).compile()
					),
					(
						state.data.addItems(chunkSize),
						state.set({renderPage: 2}).compile()
					),
					(
						state.set({isLifecycleDone: true}).compile()
					)
				];

				const resetEvent = component.waitForEvent('resetState');

				await component.scrollToTop();
				await component.updateProps({
					items: state.data.getDataChunk(0)
				});

				await resetEvent;
				await component.waitForChildCountEqualsTo(chunkSize);
				await component.scrollToBottom();
				await component.waitForChildCountEqualsTo(chunkSize * 2);
				await component.scrollToBottom();
				await component.waitForLifecycleDone();

				const
					spy = await component.getSpy((ctx) => ctx.emit),
					results = filterEmitterResults(await spy.results, true, ['initLoadStart', 'initLoad']);

				test.expect(results).toEqual([
					['resetState', states[0]],
					['initLoadStart', {...states[0], isLoadingInProgress: true}],
					['initLoad', {...states[0], isLoadingInProgress: true}],
					['dataLoadSuccess', states[1]],
					['renderStart', states[1]],
					['renderEngineStart', states[1]],
					['renderEngineDone', states[1]],
					['domInsertStart', states[2]],
					['domInsertDone', states[2]],
					['renderDone', states[2]],
					['renderStart', states[3]],
					['renderEngineStart', states[3]],
					['renderEngineDone', states[3]],
					['domInsertStart', states[4]],
					['domInsertDone', states[4]],
					['renderDone', states[4]],
					['lifecycleDone', states[5]]
				]);
			});
		});
	});
});
