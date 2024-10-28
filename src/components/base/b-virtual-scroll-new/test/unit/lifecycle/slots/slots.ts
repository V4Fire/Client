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

import type { ShouldPerform } from 'components/base/b-virtual-scroll-new/b-virtual-scroll-new';
import type { SlotsStateObj } from 'components/base/b-virtual-scroll-new/modules/slots';

import { createTestHelpers } from 'components/base/b-virtual-scroll-new/test/api/helpers';

// eslint-disable-next-line max-lines-per-function
test.describe('<b-virtual-scroll-new>', () => {
	let
		component: Awaited<ReturnType<typeof createTestHelpers>>['component'],
		provider: Awaited<ReturnType<typeof createTestHelpers>>['provider'],
		state: Awaited<ReturnType<typeof createTestHelpers>>['state'];

	test.beforeEach(async ({demoPage, page}) => {
		await demoPage.goto();

		({component, provider, state} = await createTestHelpers(page));
		await provider.start();

		await component.withChildren({
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
			tombstoneCount: 1
		});
	});

	test.describe('`container`', () => {
		test('hidden after request params changed until first render', async () => {
			const chunkSize = 12;

			provider
				.responseOnce(200, {data: state.data.addData(chunkSize)})
				.responseOnce(200, {data: state.data.addData(chunkSize)})
				.response(200, {data: []})
				.responder();

			await component
				.withDefaultPaginationProviderProps({chunkSize})
				.withProps({chunkSize})
				.build({useDummy: true});

			await test.expect.poll(() => provider.calls).toHaveLength(1);
			await test.expect(component.container).toBeHidden();

			await provider.respond();
			await component.waitForChildCountEqualsTo(chunkSize);
			await component.updateProps({request: {get: {someParam: 1}}});

			await test.expect.poll(() => provider.calls).toHaveLength(2);
			await test.expect(component.container).toBeHidden();

			await provider.respond();
			await component.waitForChildCountEqualsTo(chunkSize);

			await test.expect(component.container).toBeVisible();

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

	test.describe('`done`', () => {
		test('activates when all data has been loaded after the initial load', async () => {
			const chunkSize = 12;

			provider
				.responseOnce(200, {data: state.data.addData(chunkSize)})
				.response(200, {data: []});

			await component
				.withDefaultPaginationProviderProps({chunkSize})
				.withProps({chunkSize})
				.build();

			await component.waitForChildCountEqualsTo(chunkSize);
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

		test('activates when all data has been loaded after the second load', async () => {
			const chunkSize = 12;

			provider
				.responseOnce(200, {data: state.data.addData(chunkSize)})
				.responseOnce(200, {data: state.data.addData(chunkSize)})
				.response(200, {data: []});

			await component
				.withDefaultPaginationProviderProps({chunkSize})
				.withProps({
					chunkSize,
					shouldPerformDataRender: () => true
				})
				.build();

			await component.waitForDataIndexChild(chunkSize - 1);
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

		test('activates when data loading is completed but data is less than chunkSize', async () => {
			const chunkSize = 12;

			provider
				.responseOnce(200, {data: state.data.addData(chunkSize / 2)})
				.response(200, {data: []});

			await component
				.withDefaultPaginationProviderProps({chunkSize})
				.withProps({
					chunkSize,
					shouldPerformDataRender: () => true
				})
				.build();

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

		test('does not activates if there is more data to download', async () => {
			const chunkSize = 12;

			provider
				.responseOnce(200, {data: state.data.addData(chunkSize)})
				.responseOnce(200, {data: state.data.addData(chunkSize)})
				.responseOnce(200, {data: state.data.addData(chunkSize)})
				.response(200, {data: []});

			const shouldPerformDataRender =
				<ShouldPerform>(({isInitialRender, remainingItems}) => isInitialRender || remainingItems === 0);

			await component
				.withDefaultPaginationProviderProps({chunkSize})
				.withProps({
					chunkSize,
					shouldPerformDataRender
				})
				.build();

			await component.waitForChildCountEqualsTo(chunkSize);
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
		test('activates when no data has been loaded after the initial load', async () => {
			const chunkSize = 12;

			provider.response(200, {data: []});

			await component
				.withDefaultPaginationProviderProps({chunkSize})
				.withProps({
					chunkSize,
					shouldPerformDataRender: () => true
				})
				.build();

			await component.waitForSlotState('empty', true);

			const
				slots = await component.getSlotsState();

			test.expect(slots).toEqual(<Required<SlotsStateObj>>{
				container: false,
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
		test('activates while initial data loading in progress', async () => {
			const chunkSize = 12;

			provider
				.response(200, {data: state.data.addData(chunkSize)}, {delay: (10).seconds()});

			await component
				.withDefaultPaginationProviderProps({chunkSize})
				.withProps({chunkSize})
				.build();

			await component.waitForSlotState('loader', true);

			const
				slots = await component.getSlotsState();

			test.expect(slots).toEqual(<Required<SlotsStateObj>>{
				container: false,
				done: false,
				empty: false,
				loader: true,
				renderNext: false,
				retry: false,
				tombstones: true
			});
		});

		test('active while initial load loads all data', async () => {
			const
				chunkSize = 12,
				providerChunkSize = chunkSize / 2;

			provider
				.response(200, {data: state.data.addData(providerChunkSize)}, {delay: (4).seconds()});

			await component
				.withDefaultPaginationProviderProps({chunkSize})
				.withProps({chunkSize})
				.build();

			let i = 0;

			while (i < 4) {
				await component.waitForSlotState('loader', true);

				const
					slots = await component.getSlotsState();

				test.expect(slots).toEqual(<Required<SlotsStateObj>>{
					container: false,
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
		test('activates when a data load error occurred during initial loading', async () => {
			const chunkSize = 12;

			provider.response(500, {});

			await component
				.withDefaultPaginationProviderProps({chunkSize})
				.withProps({
					chunkSize,
					shouldPerformDataRender: () => true
				})
				.build();

			await component.waitForSlotState('retry', true);

			const
				slots = await component.getSlotsState();

			test.expect(slots).toEqual(<Required<SlotsStateObj>>{
				container: false,
				done: false,
				empty: false,
				loader: false,
				renderNext: false,
				retry: true,
				tombstones: false
			});
		});

		test('activates when a data load error occurred during initial loading of the second data chunk', async () => {
			const
				chunkSize = 12,
				providerChunkSize = chunkSize / 2;

			provider
				.responseOnce(200, {data: state.data.addData(providerChunkSize)})
				.response(500, {});

			await component
				.withDefaultPaginationProviderProps({chunkSize})
				.withProps({
					chunkSize,
					shouldPerformDataRender: () => true
				})
				.build();

			await component.waitForSlotState('retry', true);

			const
				slots = await component.getSlotsState();

			test.expect(slots).toEqual(<Required<SlotsStateObj>>{
				container: false,
				done: false,
				empty: false,
				loader: false,
				renderNext: false,
				retry: true,
				tombstones: false
			});
		});

		test('activates when a data load error ocurred during loading of second data chunk', async () => {
			const chunkSize = 12;

			provider
				.responseOnce(200, {data: state.data.addData(chunkSize)})
				.response(500, {});

			await component
				.withDefaultPaginationProviderProps({chunkSize})
				.withProps({
					chunkSize
				})
				.build();

			await component.waitForChildCountEqualsTo(chunkSize);
			await component.scrollToBottom();
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
			await component.withChildren({
				renderNext: {
					type: 'div',
					attrs: {
						id: 'renderNext'
					}
				}
			});
		});

		test('activates when data is loaded', async () => {
			const chunkSize = 12;

			provider
				.responseOnce(200, {data: state.data.addData(chunkSize)})
				.response(200, {data: []});

			await component
				.withDefaultPaginationProviderProps({chunkSize})
				.withProps({
					chunkSize,
					disableObserver: true,
					shouldPerformDataRender: () => true
				})
				.build();

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

		test('doesn\'t activates while data is loading', async ({page}) => {
			const chunkSize = 12;

			provider
				.responseOnce(200, {data: state.data.addData(chunkSize)}, {delay: (10).seconds()})
				.response(200, {data: []});

			await component
				.withDefaultPaginationProviderProps({chunkSize})
				.withProps({
					chunkSize,
					disableObserver: true,
					shouldPerformDataRender: () => true
				})
				.build();

			await BOM.waitForIdleCallback(page);
			await component.waitForSlotState('renderNext', false);

			const
				slots = await component.getSlotsState();

			test.expect(slots).toEqual(<Required<SlotsStateObj>>{
				container: false,
				done: false,
				empty: false,
				loader: true,
				renderNext: false,
				retry: false,
				tombstones: true
			});
		});

		test('doesn\'t activates if there\'s a data loading error', async () => {
			const chunkSize = 12;

			provider.response(500, {data: []});

			await component
				.withDefaultPaginationProviderProps({chunkSize})
				.withProps({
					chunkSize,
					disableObserver: true,
					shouldPerformDataRender: () => true
				})
				.build();

			await component.waitForSlotState('renderNext', false);
			await component.waitForSlotState('tombstones', false);

			const
				slots = await component.getSlotsState();

			test.expect(slots).toEqual(<Required<SlotsStateObj>>{
				container: false,
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
