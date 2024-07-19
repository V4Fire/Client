/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import test from 'tests/config/unit/test';

import type { VirtualScrollTestHelpers } from 'components/base/b-virtual-scroll-new/test/api/helpers/interface';
import { createTestHelpers, filterEmitterCalls } from 'components/base/b-virtual-scroll-new/test/api/helpers';

test.describe('b-virtual-scroll-new requests lifecycle', () => {
	let
		component: VirtualScrollTestHelpers['component'],
		provider: VirtualScrollTestHelpers['provider'],
		state: VirtualScrollTestHelpers['state'];

	test.beforeEach(async ({demoPage, page}) => {
		await demoPage.goto();

		({component, provider, state} = await createTestHelpers(page));
		await provider.start();
	});

	test('should cancel the `initLoadNext` when the promise is created, but the request is not', async () => {
		const chunkSize = 10;

		provider
			.responseOnce(200, {data: state.data.addData(chunkSize)})
			.response(200, {data: []})
			.responder();

		await component
			.withDefaultPaginationProviderProps({chunkSize})
			.withProps({
				chunkSize,
				'@hook:beforeDataCreate': (ctx) => jestMock.spy(ctx, 'emit')
			})
			.build();

		await component.evaluate((ctx) => {
			const originalWaitPermissionToRequest = ctx.waitPermissionToRequest.bind(ctx);
			const originalInitLoadNext = ctx.initLoadNext.bind(ctx);

			ctx.waitPermissionToRequest = (...args) => new Promise(
				(resolve) => setTimeout(() => resolve(originalWaitPermissionToRequest(...args)))
			);

			ctx.initLoadNext = () => {
				const p = originalInitLoadNext();

				// @ts-ignore (protected method)
				ctx.reset();

				return p;
			};
		});

		await provider.unresponder();
		await component.waitForChildCountEqualsTo(chunkSize);
		await component.evaluate((ctx) => ctx.initLoadNext());

		const
			spy = await component.getSpy((ctx) => ctx.emit),
			calls = filterEmitterCalls(await spy.calls, true, ['initLoad', 'initLoadStart']).map(([event]) => event);

		test.expect(calls).toEqual([
			'initLoadStart',
			'dataLoadStart',
			'convertDataToDB',
			'initLoad',
			'dataLoadSuccess',
			'renderStart',
			'renderEngineStart',
			'renderEngineDone',
			'domInsertStart',
			'domInsertDone',
			'renderDone',

			// Next page loading
			'dataLoadStart',
			'resetState'
		]);
	});
});
