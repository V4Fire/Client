/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * @file Test cases of the component lifecycle initialization.
 */

import test from 'tests/config/unit/test';

import type bVirtualScrollNew from 'base/b-virtual-scroll-new/b-virtual-scroll-new';

import { createTestHelpers } from 'base/b-virtual-scroll-new/test/api/helpers';
import type { VirtualScrollTestHelpers } from 'base/b-virtual-scroll-new/test/api/helpers/interface';

test.describe('<b-virtual-scroll-new>', () => {
	let
		component: VirtualScrollTestHelpers['component'],
		initLoadSpy: VirtualScrollTestHelpers['initLoadSpy'],
		provider: VirtualScrollTestHelpers['provider'],
		state: VirtualScrollTestHelpers['state'];

	const hookProp = {
		'@componentHook:beforeDataCreate': (ctx: bVirtualScrollNew['unsafe']) => {
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

	test.describe('property `chunkSize` is set to 12', () => {
		test.describe('loaded data array is half length of the `chunkSize` prop', () => {
			test.describe('`shouldStopRequestingData` returns true after the initial loading', () => {
				const
					chunkSize = 12,
					providerChunkSize = chunkSize / 2;

				let
					shouldStopRequestingData;

				test.beforeEach(async () => {
					shouldStopRequestingData = await component.mockFn(() => true);

					state.data.addData(providerChunkSize);
					state.data.addItems(providerChunkSize);

					await component
						.withDefaultPaginationProviderProps({chunkSize: providerChunkSize})
						.withProps({
							chunkSize,
							shouldStopRequestingData,
							disableObserver: true,
							...hookProp
						})
						.build();

					await component.waitForChildCountEqualsTo(providerChunkSize);
				});

				test('should render 6 items', async () => {
					await test.expect(component.getChildCount()).resolves.toBe(providerChunkSize);
				});

				test('should call `shouldStopRequestingData` once', async () => {
					await test.expect(shouldStopRequestingData.calls).resolves.toEqual([
						[
							state.compile({
								remainingItems: undefined,
								remainingChildren: undefined,
								maxViewedItem: undefined,
								maxViewedChild: undefined,
								areRequestsStopped: false,
								loadPage: 1
							}),
							test.expect.any(Object)
						]
					]);
				});

				test('should call `initLoad` once', async () => {
					await test.expect(initLoadSpy.calls).resolves.toEqual([[]]);
				});

				test('should end the component lifecycle', async () => {
					await test.expect(component.waitForLifecycleDone()).resolves.toBeUndefined();
				});
			});
		});
	});
});
