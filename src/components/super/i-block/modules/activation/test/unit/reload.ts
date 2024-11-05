/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { JSHandle } from 'playwright';
import test from 'tests/config/unit/test';

import { BOM, Component, RequestInterceptor } from 'tests/helpers';
import { createSpy } from 'tests/helpers/mock';

import type bDummy from 'components/dummies/b-dummy/b-dummy';

test.describe('<i-block> modules - reload', () => {
	let
		target: JSHandle<bDummy>,
		interceptor: RequestInterceptor;

	test.beforeEach(async ({demoPage, page}) => {
		await demoPage.goto();
		interceptor = new RequestInterceptor(page, /api/);

		await interceptor
			.response(200, {data: 'foo'}, {delay: 50})
			.start();
	});

	test.describe('reloadOnActivation = true', () => {
		test.beforeEach(async ({page}) => {
			target = await Component.createComponent(page, 'b-dummy', {
				dataProvider: 'Provider',
				reloadOnActivation: true
			});
		});

		test('should cancel the pending request when the component is deactivated', async () => {
			const mockClearRequest = await createSpy(target, (ctx) => jestMock.spy(ctx.unsafe.async, 'muteRequest'));

			await target.evaluate((ctx) => ctx.deactivate());

			await test.expect(mockClearRequest.calls).resolves.toEqual([[{group: 'i-data:initLoad'}]]);
		});

		test('should reload the data on activation even if the data is already loaded', async ({page}) => {
			const mockReload = await createSpy(target, (ctx) => jestMock.spy(ctx, 'reload'));

			await target.evaluate(async (ctx) => {
				await ctx.unsafe.async.sleep(50);

				ctx.deactivate();

				await ctx.waitComponentStatus('inactive');

				ctx.activate();
			});

			await BOM.waitForIdleCallback(page);

			// We expect the reload method to be called twice because we have both safe and unsafe async modules
			await test.expect(mockReload.callsCount).resolves.toBe(2);
		});
	});

	test.describe('reloadOnActivation = false', () => {
		test.beforeEach(async ({page}) => {
			target = await Component.createComponent(page, 'b-dummy', {
				dataProvider: 'Provider'
			});
		});

		test('should not reload the data on activation if the data is already loaded', async ({page}) => {
			const mockReload = await createSpy(target, (ctx) => jestMock.spy(ctx, 'reload'));

			await target.evaluate(async (ctx) => {
				await ctx.unsafe.async.sleep(50);

				ctx.deactivate();

				await ctx.waitComponentStatus('inactive');

				ctx.activate();
			});

			await BOM.waitForIdleCallback(page);

			await test.expect(mockReload.callsCount).resolves.toBe(0);
		});

		test('should continue the pending request when the component is deactivated', async ({page}) => {
			const mockClearRequest = await createSpy(target, (ctx) => jestMock.spy(ctx.unsafe.async, 'muteRequest'));

			const isReadyOnceAfterDeactivate = await target.evaluate(async (ctx) => {
				ctx.deactivate();

				await ctx.unsafe.async.sleep(50);

				return ctx.isReadyOnce;
			});

			test.expect(isReadyOnceAfterDeactivate).toBe(false);

			await target.evaluate((ctx) => ctx.activate());

			const isReadyOnceAfterActivate = await target.evaluate((ctx) => ctx.isReadyOnce);

			test.expect(isReadyOnceAfterActivate).toBe(true);
			await test.expect(mockClearRequest.calls).resolves.toEqual([]);
		});
	});
});
