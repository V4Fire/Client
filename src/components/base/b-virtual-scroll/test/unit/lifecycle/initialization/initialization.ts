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

import { defaultShouldProps } from 'components/base/b-virtual-scroll/const';
import { createTestHelpers } from 'components/base/b-virtual-scroll/test/api/helpers';
import type { VirtualScrollTestHelpers } from 'components/base/b-virtual-scroll/test/api/helpers/interface';
import type bVirtualScroll from 'components/base/b-virtual-scroll/b-virtual-scroll';

test.describe('<b-virtual-scroll>', () => {
	let
		component: VirtualScrollTestHelpers['component'],
		initLoadSpy: VirtualScrollTestHelpers['initLoadSpy'],
		provider: VirtualScrollTestHelpers['provider'],
		state: VirtualScrollTestHelpers['state'];

	const hookProp = {
		'@hook:beforeDataCreate': (ctx: bVirtualScroll['unsafe']) => {
			const
				original = ctx.componentInternalState.compile.bind(ctx.componentInternalState);

			ctx.componentInternalState.compile = () => ({...original()});
			jestMock.spy(ctx, 'initLoadNext');
		}
	};

	test.beforeEach(async ({demoPage, page}) => {
		await demoPage.goto();

		({component, initLoadSpy, provider, state} = await createTestHelpers(page));
		await provider.start();
	});

	test.describe('Property `chunkSize` is set to 12', () => {
		test.describe('Loaded data array is half length of the `chunkSize` prop', () => {
			test.describe('`shouldPerformDataRequest` returns true after the initial loading', () => {
				let
					shouldStopRequestingData,
					shouldPerformDataRequest;

				let
					firstDataChunk,
					secondDataChunk;

				const
					chunkSize = 12;

				test.beforeEach(async () => {
					const providerChunkSize = chunkSize / 2;

					shouldStopRequestingData = await component.mockFn(() => false);
					shouldPerformDataRequest = await component.mockFn(defaultShouldProps.shouldPerformDataRequest);

					firstDataChunk = state.data.addData(providerChunkSize);
					secondDataChunk = state.data.addData(providerChunkSize);

					state.data.addItems(chunkSize);

					await component.withProps({
						chunkSize,
						shouldStopRequestingData,
						shouldPerformDataRequest,
						disableObserver: true,
						...hookProp
					});

					await component.withDefaultPaginationProviderProps({chunkSize: providerChunkSize});
					await component.build();
					await component.waitForContainerChildCountEqualsTo(chunkSize);
				});

				test('Should render 12 items', async () => {
					await test.expect(component.getContainerChildCount()).resolves.toBe(chunkSize);
				});

				test('Should call `shouldStopRequestingData` twice', async () => {
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
				});

				test('Should call `shouldPerformDataRequest` once', async () => {
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
				});

				test('Should call `initLoad` once', async () => {
					await test.expect(initLoadSpy.calls).resolves.toEqual([[]]);
				});

				test('Should call `initLoadNext` once', async () => {
					const
						spy = await component.getSpy((ctx) => ctx.initLoadNext);

					await test.expect(spy.calls).resolves.toEqual([[]]);
				});
			});
		});
	});

	test.describe('Property `chunkSize` is set to 12', () => {
		test.describe('Loaded data array is half length of the `chunkSize` prop', () => {
			test.describe('`shouldPerformDataRequest` returns false after the initial loading', () => {
				let
					shouldStopRequestingData,
					shouldPerformDataRequest;

				const
					chunkSize = 12,
					providerChunkSize = chunkSize / 2;

				test.beforeEach(async () => {
					shouldStopRequestingData = await component.mockFn(() => false);
					shouldPerformDataRequest = await component.mockFn(() => false);

					state.data.addData(providerChunkSize);
					state.data.addItems(providerChunkSize);

					await component.withProps({
						chunkSize,
						shouldStopRequestingData,
						shouldPerformDataRequest,
						disableObserver: true,
						...hookProp
					});

					await component.withDefaultPaginationProviderProps({chunkSize: providerChunkSize});
					await component.build();
					await component.waitForContainerChildCountEqualsTo(providerChunkSize);
				});

				test('Should render 6 items', async () => {
					await test.expect(component.getContainerChildCount()).resolves.toBe(providerChunkSize);
				});

				test('Should call `shouldStopRequestingData` once', async () => {
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
				});

				test('Should call `shouldPerformDataRequest` once', async () => {
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
				});

				test('Should call `initLoad` once', async () => {
					await test.expect(initLoadSpy.calls).resolves.toEqual([[]]);
				});
			});
		});
	});

	test.describe('Property `chunkSize` is set to 12', () => {
		test.describe('Loaded data array is half length of the `chunkSize` prop', () => {
			test.describe('`shouldStopRequestingData` returns true after the initial loading', () => {
				const
					chunkSize = 12,
					providerChunkSize = chunkSize / 2;

				let
					shouldStopRequestingData,
					shouldPerformDataRequest;

				test.beforeEach(async () => {
					shouldStopRequestingData = await component.mockFn(() => true);
					shouldPerformDataRequest = await component.mockFn(() => false);

					state.data.addData(providerChunkSize);
					state.data.addItems(providerChunkSize);

					await component.withProps({
						chunkSize,
						shouldStopRequestingData,
						shouldPerformDataRequest,
						disableObserver: true,
						...hookProp
					});

					await component.withDefaultPaginationProviderProps({chunkSize: providerChunkSize});
					await component.build();
					await component.waitForContainerChildCountEqualsTo(providerChunkSize);
				});

				test('Should render 6 items', async () => {
					await test.expect(component.getContainerChildCount()).resolves.toBe(providerChunkSize);
				});

				test('Should call `shouldStopRequestingData` once', async () => {
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
				});

				test('Should call `shouldPerformDataRequest` once', async () => {
					await test.expect(shouldPerformDataRequest.calls).resolves.toEqual([]);
				});

				test('Should call `initLoad` once', async () => {
					await test.expect(initLoadSpy.calls).resolves.toEqual([[]]);
				});

				test('Should end the component lifecycle', async () => {
					await test.expect(component.waitForLifecycleDone()).resolves.toBeUndefined();
				});
			});
		});
	});
});
