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

import delay from 'delay';

import test from 'tests/config/unit/test';

import { createTestHelpers } from 'components/base/b-scrolly/test/api/helpers';
import type { SlotsStateObj } from 'components/base/b-scrolly/modules/slots';
import type { ShouldFn } from 'components/base/b-scrolly/b-scrolly';

test.describe('<b-scrolly> slots', () => {
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

		await component.setProps({
			tombstonesSize: 1
		});
	});

	test.describe('`done`', () => {
		test('Activates when all data has been loaded after the initial load', async () => {
			const chunkSize = 12;

			provider
				.responseOnce(200, {data: state.data.addData(chunkSize)})
				.response(200, {data: []});

			await component.setProps({
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

			await component.setProps({
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

			await component.setProps({
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

			await component.setProps({
				chunkSize,
				// eslint-disable-next-line max-len
				shouldPerformDataRequest: <ShouldFn>(({isInitialLoading, itemsTillEnd}) => isInitialLoading || itemsTillEnd === 0),
				shouldPerformDataRender: <ShouldFn>(({isInitialRender, itemsTillEnd}) => isInitialRender || itemsTillEnd === 0)
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

			await component.setProps({
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

			await component.setProps({
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

			await component.setProps({
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

			await component.setProps({
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

			await component.setProps({
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

	test.skip('renderNext', async () => {
		// ...
	});
});
