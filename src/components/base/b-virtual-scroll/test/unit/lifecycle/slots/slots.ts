/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * @file This file describes test cases for checking the correctness of displaying component slots in different states.
 */

import delay from 'delay';

import test from 'tests/config/unit/test';

import { BOM } from 'tests/helpers';

import type { ShouldPerform } from 'components/base/b-virtual-scroll/b-virtual-scroll';
import type { SlotsStateObj } from 'components/base/b-virtual-scroll/modules/slots';

import { createTestHelpers } from 'components/base/b-virtual-scroll/test/api/helpers';

// eslint-disable-next-line max-lines-per-function
test.describe('<b-virtual-scroll>', () => {
	let
		component: Awaited<ReturnType<typeof createTestHelpers>>['component'],
		provider: Awaited<ReturnType<typeof createTestHelpers>>['provider'],
		state: Awaited<ReturnType<typeof createTestHelpers>>['state'];

	test.beforeEach(async ({demoPage, page}) => {
		await demoPage.goto();

		({component, provider, state} = await createTestHelpers(page));
		await provider.start();

		await component.setChildren({
			done: {
				type: 'div',
				attrs: {
					id: 'done'
				}
			},

			empty: {
				type: 'div',
				attrs: {
					id: 'empty'
				}
			},

			retry: {
				type: 'div',
				attrs: {
					id: 'retry'
				}
			},

			tombstone: {
				type: 'div',
				attrs: {
					id: 'tombstone'
				}
			},

			loader: {
				type: 'div',
				attrs: {
					id: 'loader'
				}
			}
		});

		await component.withProps({
			tombstonesSize: 1
		});
	});

	test.describe('`done`', () => {
		test('Activates when all data has been loaded after the initial load', async () => {
			const chunkSize = 12;

			provider
				.responseOnce(200, {data: state.data.addData(chunkSize)})
				.response(200, {data: []});

			await component.withProps({
				chunkSize
			});

			await component.withDefaultPaginationProviderProps({chunkSize});
			await component.build();
			await component.waitForSlotState('done', true);

			const
				slots = await component.getSlotsState();

			test.expect(slots).toEqual(<Required<SlotsStateObj>>{
				container: true,
				done: true,
				empty: false,
				loader: false,
				renderNext: false,
				retry: false,
				tombstones: false
			});
		});

		test('Activates when all data has been loaded after the second load', async () => {
			const chunkSize = 12;

			provider
				.responseOnce(200, {data: state.data.addData(chunkSize)})
				.responseOnce(200, {data: state.data.addData(chunkSize)})
				.response(200, {data: []});

			await component.withProps({
				chunkSize,
				shouldPerformDataRender: () => true
			});

			await component.withDefaultPaginationProviderProps({chunkSize});
			await component.build();
			await component.scrollToBottom();
			await component.waitForSlotState('done', true);

			const
				slots = await component.getSlotsState();

			test.expect(slots).toEqual(<Required<SlotsStateObj>>{
				container: true,
				done: true,
				empty: false,
				loader: false,
				renderNext: false,
				retry: false,
				tombstones: false
			});
		});

		test('Activates when data loading is completed but data is less than chunkSize', async () => {
			const chunkSize = 12;

			provider
				.responseOnce(200, {data: state.data.addData(chunkSize / 2)})
				.response(200, {data: []});

			await component.withProps({
				chunkSize,
				shouldPerformDataRender: () => true
			});

			await component.withDefaultPaginationProviderProps({chunkSize});
			await component.build();
			await component.waitForSlotState('done', true);

			const
				slots = await component.getSlotsState();

			test.expect(slots).toEqual(<Required<SlotsStateObj>>{
				container: true,
				done: true,
				empty: false,
				loader: false,
				renderNext: false,
				retry: false,
				tombstones: false
			});
		});

		test('Does not activates if there is more data to download', async () => {
			const chunkSize = 12;

			provider
				.responseOnce(200, {data: state.data.addData(chunkSize)})
				.responseOnce(200, {data: state.data.addData(chunkSize)})
				.responseOnce(200, {data: state.data.addData(chunkSize)})
				.response(200, {data: []});

			const shouldPerformDataRequest =
				<ShouldPerform>(({isInitialLoading, itemsTillEnd}) => isInitialLoading || itemsTillEnd === 0);

			const shouldPerformDataRender =
				<ShouldPerform>(({isInitialRender, itemsTillEnd}) => isInitialRender || itemsTillEnd === 0);

			await component.withProps({
				chunkSize,
				shouldPerformDataRequest,
				shouldPerformDataRender
			});

			await component.withDefaultPaginationProviderProps({chunkSize});
			await component.build();
			await component.waitForContainerChildCountEqualsTo(chunkSize);
			await component.waitForSlotState('loader', false);

			const
				slots = await component.getSlotsState();

			test.expect(slots).toEqual(<Required<SlotsStateObj>>{
				container: true,
				done: false,
				empty: false,
				loader: false,
				renderNext: false,
				retry: false,
				tombstones: false
			});
		});
	});

	test.describe('empty', () => {
		test('Activates when no data has been loaded after the initial load', async () => {
			const chunkSize = 12;

			provider.response(200, {data: []});

			await component.withProps({
				chunkSize,
				shouldPerformDataRender: () => true
			});

			await component.withDefaultPaginationProviderProps({chunkSize});
			await component.build();
			await component.waitForSlotState('empty', true);

			const
				slots = await component.getSlotsState();

			test.expect(slots).toEqual(<Required<SlotsStateObj>>{
				container: true,
				done: true,
				empty: true,
				loader: false,
				renderNext: false,
				retry: false,
				tombstones: false
			});
		});
	});

	test.describe('tombstone & loader', () => {
		test('Activates while initial data loading in progress', async () => {
			const chunkSize = 12;

			provider
				.response(200, {data: state.data.addData(chunkSize)}, {delay: (10).seconds()});

			await component.withProps({
				chunkSize
			});

			await component.withDefaultPaginationProviderProps({chunkSize});
			await component.build();
			await component.waitForSlotState('loader', true);

			const
				slots = await component.getSlotsState();

			test.expect(slots).toEqual(<Required<SlotsStateObj>>{
				container: true,
				done: false,
				empty: false,
				loader: true,
				renderNext: false,
				retry: false,
				tombstones: true
			});
		});

		test('Active while initial load loads all data', async () => {
			const
				chunkSize = 12,
				providerChunkSize = chunkSize / 2;

			provider
				.response(200, {data: state.data.addData(providerChunkSize)}, {delay: (4).seconds()});

			await component.withProps({
				chunkSize
			});

			await component.withDefaultPaginationProviderProps({chunkSize});
			await component.build();

			let i = 0;

			while (i < 4) {
				await component.waitForSlotState('loader', true);

				const
					slots = await component.getSlotsState();

				test.expect(slots).toEqual(<Required<SlotsStateObj>>{
					container: true,
					done: false,
					empty: false,
					loader: true,
					renderNext: false,
					retry: false,
					tombstones: true
				});

				await delay(700);
				i++;
			}
		});
	});

	test.describe('retry', () => {
		test('Activates when a data load error occurred during initial loading', async () => {
			const chunkSize = 12;

			provider.response(500, {});

			await component.withProps({
				chunkSize,
				shouldPerformDataRender: () => true
			});

			await component.withDefaultPaginationProviderProps({chunkSize});
			await component.build();
			await component.waitForSlotState('retry', true);

			const
				slots = await component.getSlotsState();

			test.expect(slots).toEqual(<Required<SlotsStateObj>>{
				container: true,
				done: false,
				empty: false,
				loader: false,
				renderNext: false,
				retry: true,
				tombstones: false
			});
		});

		test('Activates when a data load error occurred during initial loading of the second data chunk', async () => {
			const
				chunkSize = 12,
				providerChunkSize = chunkSize / 2;

			provider
				.responseOnce(200, {data: state.data.addData(providerChunkSize)})
				.response(500, {});

			await component.withProps({
				chunkSize,
				shouldPerformDataRender: () => true
			});

			await component.withDefaultPaginationProviderProps({chunkSize});
			await component.build();
			await component.waitForSlotState('retry', true);

			const
				slots = await component.getSlotsState();

			test.expect(slots).toEqual(<Required<SlotsStateObj>>{
				container: true,
				done: false,
				empty: false,
				loader: false,
				renderNext: false,
				retry: true,
				tombstones: false
			});
		});
	});

	test.describe('renderNext', () => {
		test.beforeEach(async () => {
			await component.setChildren({
				renderNext: {
					type: 'div',
					attrs: {
						id: 'renderNext'
					}
				}
			});
		});

		test('Activates when data is loaded', async () => {
			const chunkSize = 12;

			provider
				.responseOnce(200, {data: state.data.addData(chunkSize)})
				.response(200, {data: []});

			await component.withProps({
				chunkSize,
				disableObserver: true,
				shouldPerformDataRender: () => true
			});

			await component.withDefaultPaginationProviderProps({chunkSize});
			await component.build();
			await component.waitForSlotState('renderNext', true);

			const
				slots = await component.getSlotsState();

			test.expect(slots).toEqual(<Required<SlotsStateObj>>{
				container: true,
				done: false,
				empty: false,
				loader: false,
				renderNext: true,
				retry: false,
				tombstones: false
			});
		});

		test('Doesn\'t activates while data is loading', async ({page}) => {
			const chunkSize = 12;

			provider
				.responseOnce(200, {data: state.data.addData(chunkSize)}, {delay: (10).seconds()})
				.response(200, {data: []});

			await component.withProps({
				chunkSize,
				disableObserver: true,
				shouldPerformDataRender: () => true
			});

			await component.withDefaultPaginationProviderProps({chunkSize});
			await component.build();
			await BOM.waitForIdleCallback(page);
			await component.waitForSlotState('renderNext', false);

			const
				slots = await component.getSlotsState();

			test.expect(slots).toEqual(<Required<SlotsStateObj>>{
				container: true,
				done: false,
				empty: false,
				loader: true,
				renderNext: false,
				retry: false,
				tombstones: true
			});
		});

		test('Doesn\'t activates if there\'s a data loading error', async () => {
			const chunkSize = 12;

			provider.response(500, {data: []});

			await component.withProps({
				chunkSize,
				disableObserver: true,
				shouldPerformDataRender: () => true
			});

			await component.withDefaultPaginationProviderProps({chunkSize});
			await component.build();
			await component.waitForSlotState('renderNext', false);
			await component.waitForSlotState('tombstones', false);

			const
				slots = await component.getSlotsState();

			test.expect(slots).toEqual(<Required<SlotsStateObj>>{
				container: true,
				done: false,
				empty: false,
				loader: false,
				renderNext: false,
				retry: true,
				tombstones: false
			});
		});
	});
});
