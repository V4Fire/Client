/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * @file This file contains test cases that verify the correctness of the component state during event emission.
 */

import test from 'tests/config/unit/test';

import { createTestHelpers, filterEmitterResults } from 'components/base/b-scrolly/test/api/helpers';
import type { ScrollyTestHelpers } from 'components/base/b-scrolly/test/api/helpers/interface';

test.describe('<b-scrolly> emitter state', () => {
	let
		component: ScrollyTestHelpers['component'],
		provider: ScrollyTestHelpers['provider'],
		state: ScrollyTestHelpers['state'];

	const initialStateFields = {
		itemsTillEnd: undefined,
		childTillEnd: undefined,
		maxViewedChild: undefined,
		maxViewedItem: undefined
	};

	test.beforeEach(async ({demoPage, page}) => {
		await demoPage.goto();

		({component, provider, state} = await createTestHelpers(page));
		await provider.start();
	});

	test('All data has been loaded after the initial load', async () => {
		const
			chunkSize = 12,
			initialState = state.compile(initialStateFields),
			data = state.data.addData(chunkSize);

		const loadedState = state.compile({
			...initialStateFields,
			loadPage: 1,
			isRequestsStopped: true
		});

		state.data.addItems(chunkSize);

		const renderedUnmountedState = state.compile({
			...initialStateFields,
			loadPage: 1,
			renderPage: 1,
			isRequestsStopped: true,
			isInitialRender: false
		});

		const renderedMountedState = state.compile({
			...initialStateFields,
			loadPage: 1,
			renderPage: 1,
			isRequestsStopped: true,
			isInitialRender: false
		});

		provider
			.responseOnce(200, {data})
			.response(200, {data: []});

		await component.setProps({
			chunkSize,
			shouldStopRequestingData: () => true,
			'@hook:beforeDataCreate': (ctx) => {
				const original = ctx.emit;

				ctx.emit = jestMock.mock((...args) => {
					original(...args);
					return [args[0], Object.fastClone(ctx.getComponentState())];
				});
			}
		});

		await component.withDefaultPaginationProviderProps({chunkSize});
		await component.build();
		await component.waitForLifecycleDone();

		const
			spy = await component.getSpy((ctx) => ctx.emit),
			results = filterEmitterResults(await spy.results, true, ['initLoadStart', 'initLoad']);

		test.expect(results).toEqual([
			[
				'initLoadStart',
				{
					...initialState,
					isLoadingInProgress: true
				}
			],
			[
				'dataLoadStart',
				{
					...initialState,
					isLoadingInProgress: true
				}
			],
			[
				'convertDataToDB',
				{
					...initialState,
					...Object.select(loadedState, ['lastLoadedRawData'])
				}
			],
			[
				'initLoad',
				{
					...initialState,
					...Object.select(loadedState, ['lastLoadedRawData'])
				}
			],
			[
				'dataLoadSuccess',
				loadedState
			],
			[
				'renderStart',
				loadedState
			],
			[
				'renderEngineStart',
				loadedState
			],
			[
				'renderEngineDone',
				loadedState
			],
			[
				'domInsertStart',
				renderedUnmountedState
			],
			[
				'domInsertDone',
				renderedMountedState
			],
			[
				'renderDone',
				renderedMountedState
			],
			[
				'lifecycleDone',
				{
					...renderedMountedState,
					itemsTillEnd: test.expect.any(Number),
					childTillEnd: test.expect.any(Number),
					maxViewedChild: test.expect.any(Number),
					maxViewedItem: test.expect.any(Number),
					isLifecycleDone: true
				}
			]
		]);
	});
});
