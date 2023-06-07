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

import test from 'tests/config/unit/test';

import { createData, createTestHelpers, indexDataCtor } from 'components/base/b-scrolly/test/api/helpers';
import type { SlotsStateObj } from 'components/base/b-scrolly/modules/slots';

test.skip('<b-scrolly> slots', () => {
	let
		component: Awaited<ReturnType<typeof createTestHelpers>>['component'],
		provider: Awaited<ReturnType<typeof createTestHelpers>>['provider'];

	test.beforeEach(async ({demoPage, page}) => {
		await demoPage.goto();

		({component, provider} = await createTestHelpers(page));
		await provider.start();

		await component.setChildren({
			done: {
				type: 'div',
				attrs: {
					id: 'done'
				}
			}
		});
	});

	test.describe('`done`', () => {
		test('Activates when all data has been loaded after the initial load', async () => {
			const chunkSize = 12;

			provider
				.responseOnce(200, {data: createData(chunkSize, indexDataCtor)})
				.response(200, {data: []});

			await component.setProps({
				chunkSize,
				shouldStopRequestingData: () => true
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
				.responseOnce(200, {data: createData(chunkSize, indexDataCtor)})
				.responseOnce(200, {data: createData(chunkSize, indexDataCtor, chunkSize)})
				.response(200, {data: []});

			await component.setProps({
				chunkSize,
				shouldStopRequestingData: ({lastLoadedRawData}) => lastLoadedRawData.data.length < 12,
				shouldPerformDataRequest: ({lastLoadedRawData}) => lastLoadedRawData.data.length >= 12,
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
				.responseOnce(200, {data: createData(chunkSize / 2, indexDataCtor)})
				.response(200, {data: []});

			await component.setProps({
				chunkSize,
				shouldStopRequestingData: () => true
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
	});

	test.describe('empty', async () => {
		// ...
	});

	test.describe('tombstone & loader', async () => {
		// ...
	});

	test.describe('retry', async () => {
		// ...
	});
});
