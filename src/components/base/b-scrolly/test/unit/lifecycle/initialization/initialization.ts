/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * @file Test cases of the component lifecycle.
 */

import test from 'tests/config/unit/test';

import { defaultShouldProps } from 'components/base/b-scrolly/const';
import { createTestHelpers } from 'components/base/b-scrolly/test/api/helpers';
import type { ScrollyTestHelpers } from 'components/base/b-scrolly/test/api/helpers/interface';

test.describe('<b-scrolly>', () => {
	let
		component: ScrollyTestHelpers['component'],
		initLoadSpy: ScrollyTestHelpers['initLoadSpy'],
		provider: ScrollyTestHelpers['provider'],
		state: ScrollyTestHelpers['state'];

	test.beforeEach(async ({demoPage, page}) => {
		await demoPage.goto();

		({component, initLoadSpy, provider, state} = await createTestHelpers(page));
		await provider.start();
	});

	test('2', async () => {
		const
			chunkSize = 12,
			providerChunkSize = chunkSize / 2;

		const
			shouldStopRequestingData = await component.mockFn(() => false),
			shouldPerformDataRequest = await component.mockFn(defaultShouldProps.shouldPerformDataRequest);

		const
			firstDataChunk = state.data.addData(providerChunkSize),
			secondDataChunk = state.data.addData(providerChunkSize);

		state.data.addItems(chunkSize);

		await component.setProps({
			chunkSize,
			shouldStopRequestingData,
			shouldPerformDataRequest,
			disableObserver: true
		});

		await component.withDefaultPaginationProviderProps({chunkSize: providerChunkSize});
		await component.build();
		await component.waitForContainerChildCountEqualsTo(chunkSize);

		await test.expect(shouldStopRequestingData.calls).resolves.toEqual([
			[
				state.compile({
					itemsTillEnd: undefined,
					childTillEnd: undefined,
					maxViewedItem: undefined,
					maxViewedChild: undefined,
					isRequestsStopped: false,
					lastLoadedData: firstDataChunk,
					lastLoadedRawData: {data: firstDataChunk},
					data: firstDataChunk,
					loadPage: 1
				}),
				test.expect.any(Object)
			],
			[
				state.compile({
					itemsTillEnd: undefined,
					childTillEnd: undefined,
					maxViewedItem: undefined,
					maxViewedChild: undefined,
					isRequestsStopped: false,
					isInitialLoading: false,
					lastLoadedData: secondDataChunk,
					lastLoadedRawData: {data: secondDataChunk},
					data: state.data.data,
					loadPage: 2
				}),
				test.expect.any(Object)
			]
		]);

		await test.expect(shouldPerformDataRequest.calls).resolves.toEqual([
			[
				state.compile({
					itemsTillEnd: undefined,
					childTillEnd: undefined,
					maxViewedItem: undefined,
					maxViewedChild: undefined,
					isRequestsStopped: false,
					lastLoadedData: firstDataChunk,
					lastLoadedRawData: {data: firstDataChunk},
					data: firstDataChunk,
					loadPage: 1
				}),
				test.expect.any(Object)
			]
		]);

		await test.expect(initLoadSpy.calls).resolves.toEqual([[], []]);
	});

	test('3', async () => {
		const
			chunkSize = 12,
			providerChunkSize = chunkSize / 2;

		const
			shouldStopRequestingData = await component.mockFn(() => false),
			shouldPerformDataRequest = await component.mockFn(() => false);

		state.data.addData(providerChunkSize);
		state.data.addItems(providerChunkSize);

		await component.setProps({
			chunkSize,
			shouldStopRequestingData,
			shouldPerformDataRequest,
			disableObserver: true
		});

		await component.withDefaultPaginationProviderProps({chunkSize: providerChunkSize});
		await component.build();
		await component.waitForContainerChildCountEqualsTo(providerChunkSize);

		await test.expect(shouldStopRequestingData.calls).resolves.toEqual([
			[
				state.compile({
					itemsTillEnd: undefined,
					childTillEnd: undefined,
					maxViewedItem: undefined,
					maxViewedChild: undefined,
					isRequestsStopped: false,
					loadPage: 1
				}),
				test.expect.any(Object)
			]
		]);

		await test.expect(shouldPerformDataRequest.calls).resolves.toEqual([
			[
				state.compile({
					itemsTillEnd: undefined,
					childTillEnd: undefined,
					maxViewedItem: undefined,
					maxViewedChild: undefined,
					isRequestsStopped: false,
					loadPage: 1
				}),
				test.expect.any(Object)
			]
		]);

		await test.expect(initLoadSpy.calls).resolves.toEqual([[]]);
	});

	test('4', async () => {
		const
			chunkSize = 12,
			providerChunkSize = chunkSize / 2;

		const
			shouldStopRequestingData = await component.mockFn(() => true),
			shouldPerformDataRequest = await component.mockFn(() => false);

		state.data.addData(providerChunkSize);
		state.data.addItems(providerChunkSize);

		await component.setProps({
			chunkSize,
			shouldStopRequestingData,
			shouldPerformDataRequest,
			disableObserver: true
		});

		await component.withDefaultPaginationProviderProps({chunkSize: providerChunkSize});
		await component.build();
		await component.waitForContainerChildCountEqualsTo(providerChunkSize);

		await test.expect(shouldStopRequestingData.calls).resolves.toEqual([
			[
				state.compile({
					itemsTillEnd: undefined,
					childTillEnd: undefined,
					maxViewedItem: undefined,
					maxViewedChild: undefined,
					isRequestsStopped: false,
					loadPage: 1
				}),
				test.expect.any(Object)
			]
		]);

		await test.expect(initLoadSpy.calls).resolves.toEqual([[]]);
		await test.expect(shouldPerformDataRequest.calls).resolves.toEqual([]);
	});
});
