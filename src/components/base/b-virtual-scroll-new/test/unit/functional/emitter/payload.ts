/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * @file This file contains test cases to verify the functionality of events emitted by the component.
 */

import test from 'tests/config/unit/test';

import { createTestHelpers, filterEmitterCalls } from 'components/base/b-virtual-scroll-new/test/api/helpers';
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
	});

	test.describe('all data has been loaded after the initial load', () => {
		test('should emit the correct set of events with the correct set of arguments', async () => {
			const chunkSize = 12;

			provider
				.responseOnce(200, {data: state.data.addData(chunkSize)})
				.response(200, {data: []});

			await component
				.withDefaultPaginationProviderProps({chunkSize})
				.withProps({
					chunkSize,
					shouldStopRequestingData: () => true,
					'@hook:beforeDataCreate': (ctx) => jestMock.spy(ctx, 'emit')
				})
				.build();

			await component.waitForLifecycleDone();

			const
				spy = await component.getSpy((ctx) => ctx.emit),
				calls = filterEmitterCalls(await spy.calls);

			test.expect(calls).toEqual([
				['dataLoadStart', true],
				['convertDataToDB', {data: state.data.data}],
				['dataLoadSuccess', state.data.data, true],
				['renderStart'],
				['renderEngineStart'],
				['renderEngineDone'],
				['domInsertStart'],
				['domInsertDone'],
				['renderDone'],
				['lifecycleDone']
			]);
		});
	});

	test.describe('all data has been loaded after the second load', () => {
		test('should emit the correct set of events with the correct set of arguments', async () => {
			const
				chunkSize = 12,
				providerChunkSize = chunkSize / 2;

			const
				firstDataChunk = state.data.addData(providerChunkSize),
				secondDataChunk = state.data.addData(providerChunkSize);

			provider
				.responseOnce(200, {data: firstDataChunk})
				.responseOnce(200, {data: secondDataChunk})
				.response(200, {data: []});

			await component
				.withDefaultPaginationProviderProps({chunkSize: providerChunkSize})
				.withProps({
					chunkSize,
					shouldStopRequestingData: ({lastLoadedData}) => lastLoadedData.length === 0,
					'@hook:beforeDataCreate': (ctx) => jestMock.spy(ctx, 'emit')
				})
				.build();

			await component.waitForChildCountEqualsTo(chunkSize);
			await component.scrollToBottom();
			await component.waitForLifecycleDone();

			const
				spy = await component.getSpy((ctx) => ctx.emit),
				calls = filterEmitterCalls(await spy.calls);

			test.expect(calls).toEqual([
				['dataLoadStart', true],
				['convertDataToDB', {data: firstDataChunk}],
				['dataLoadSuccess', firstDataChunk, true],
				['dataLoadStart', false],
				['convertDataToDB', {data: secondDataChunk}],
				['dataLoadSuccess', secondDataChunk, false],
				['renderStart'],
				['renderEngineStart'],
				['renderEngineDone'],
				['domInsertStart'],
				['domInsertDone'],
				['renderDone'],
				['dataLoadStart', false],
				['convertDataToDB', {data: []}],
				['dataLoadSuccess', [], false],
				['renderStart'],
				['renderDone'],
				['lifecycleDone']
			]);
		});
	});

	test.describe('data loading is completed but data is less than chunkSize', () => {
		test('should emit the correct set of events with the correct set of arguments', async () => {
			const
				chunkSize = 12,
				providerChunkSize = chunkSize / 2;

			const
				firstDataChunk = state.data.addData(providerChunkSize);

			provider
				.responseOnce(200, {data: firstDataChunk})
				.response(200, {data: []});

			await component
				.withDefaultPaginationProviderProps({chunkSize: providerChunkSize})
				.withProps({
					chunkSize,
					shouldStopRequestingData: ({lastLoadedData}) => lastLoadedData.length === 0,
					'@hook:beforeDataCreate': (ctx) => jestMock.spy(ctx, 'emit')
				})
				.build();

			await component.waitForChildCountEqualsTo(providerChunkSize);
			await component.waitForLifecycleDone();

			const
				spy = await component.getSpy((ctx) => ctx.emit),
				calls = filterEmitterCalls(await spy.calls);

			test.expect(calls).toEqual([
				['dataLoadStart', true],
				['convertDataToDB', {data: firstDataChunk}],
				['dataLoadSuccess', firstDataChunk, true],
				['dataLoadStart', false],
				['convertDataToDB', {data: []}],
				['dataLoadSuccess', [], false],
				['renderStart'],
				['renderEngineStart'],
				['renderEngineDone'],
				['domInsertStart'],
				['domInsertDone'],
				['renderDone'],
				['lifecycleDone']
			]);
		});
	});

	test.describe('reload was called after data was rendered', () => {
		test('should emit the correct set of events with the correct set of arguments', async () => {
			const chunkSize = 12;

			provider
				.responseOnce(200, {data: state.data.addData(chunkSize)})
				.response(200, {data: []});

			await component
				.withDefaultPaginationProviderProps({chunkSize})
				.withProps({
					chunkSize,
					shouldStopRequestingData: () => true,
					'@hook:beforeDataCreate': (ctx) => jestMock.spy(ctx, 'emit')
				})
				.build();

			await component.waitForChildCountEqualsTo(chunkSize);

			state.reset();
			provider.responseOnce(200, {data: state.data.addData(chunkSize)});

			await component.reload();
			await component.waitForChildCountEqualsTo(chunkSize);
			await component.waitForLifecycleDone();

			const
				spy = await component.getSpy((ctx) => ctx.emit),
				calls = filterEmitterCalls(await spy.calls);

			test.expect(calls).toEqual([
				['dataLoadStart', true],
				['convertDataToDB', {data: state.data.data}],
				['dataLoadSuccess', state.data.data, true],
				['renderStart'],
				['renderEngineStart'],
				['renderEngineDone'],
				['domInsertStart'],
				['domInsertDone'],
				['renderDone'],
				['lifecycleDone'],
				['resetState'],
				['dataLoadStart', true],
				['convertDataToDB', {data: state.data.data}],
				['dataLoadSuccess', state.data.data, true],
				['renderStart'],
				['renderEngineStart'],
				['renderEngineDone'],
				['domInsertStart'],
				['domInsertDone'],
				['renderDone'],
				['lifecycleDone']
			]);
		});
	});
});
