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

import { defaultProps } from 'components/base/b-scrolly/const';
import { createTestHelpers } from 'components/base/b-scrolly/test/api/helpers';

test.describe('<b-scrolly>', () => {
	let
		component: Awaited<ReturnType<typeof createTestHelpers>>['component'],
		initLoadSpy: Awaited<ReturnType<typeof createTestHelpers>>['initLoadSpy'],
		provider:Awaited<ReturnType<typeof createTestHelpers>>['provider'],
		state: Awaited<ReturnType<typeof createTestHelpers>>['state'];

	test.beforeEach(async ({demoPage, page}) => {
		await demoPage.goto();

		({component, initLoadSpy, provider, state} = await createTestHelpers(page));
		await provider.start();
	});

	test('1', async () => {
		const chunkSize = 12;

		await component.setProps({
			chunkSize,
			disableObserver: true
		});

		await component.withDefaultPaginationProviderProps({chunkSize});
		await component.build();

		await test.expect(component.waitForContainerChildCountEqualsTo(chunkSize)).resolves.toBeUndefined();
	});

	test('2', async () => {
		const
			chunkSize = 12,
			providerChunkSize = chunkSize / 2;

		const
			shouldStopRequestingData = await component.mockFn(() => false),
			shouldPerformDataRequest = await component.mockFn(defaultProps.shouldPerformDataRequest);

		const data = state.data.addData(providerChunkSize);
		state.data.addData(providerChunkSize);
		state.data.addMounted(chunkSize);

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
					isRenderingDone: false,
					isRequestsStopped: false,
					lastLoadedData: data,
					lastLoadedRawData: {data},
					data,
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
					isRenderingDone: false,
					isRequestsStopped: false,
					lastLoadedData: data,
					lastLoadedRawData: {data},
					data,
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

		state.setLoadPage(1);
		state.data.addData(providerChunkSize);
		state.data.addMounted(providerChunkSize);

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
					isRenderingDone: false,
					isRequestsStopped: false
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
					isRenderingDone: false,
					isRequestsStopped: false
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

		state.setLoadPage(1);
		state.data.addData(providerChunkSize);
		state.data.addMounted(providerChunkSize);

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
					isRenderingDone: false,
					isRequestsStopped: false
				}),
				test.expect.any(Object)
			]
		]);

		await test.expect(initLoadSpy.calls).resolves.toEqual([[]]);
		await test.expect(shouldPerformDataRequest.calls).resolves.toEqual([]);
	});
});
