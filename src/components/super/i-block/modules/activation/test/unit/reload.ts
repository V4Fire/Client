/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { JSHandle } from 'playwright';
import test from 'tests/config/unit/test';

import { Component, RequestInterceptor } from 'tests/helpers';
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
			.responder()
			.response(200, {data: 'foo'})
			.start();
	});

	test.describe('reloadOnActivation = true', () => {
		test.beforeEach(async ({page}) => {
			target = await Component.createComponent(page, 'b-dummy', {
				dataProvider: 'Provider',
				reloadOnActivation: true
			});
		});

		test('should mute the pending request when the component is deactivated', async () => {
			const mockMuteRequest = await createSpy(target, (ctx) => jestMock.spy(ctx.unsafe.async, 'muteRequest'));

			await target.evaluate((ctx) => ctx.deactivate());
			await interceptor.respond();

			await test.expect(mockMuteRequest.callsCount).resolves.toBe(1);
		});

		test('should reload the data on activation even if the data is already loaded', async () => {
			await interceptor.respond();
			const mockReload = await createSpy(target, (ctx) => jestMock.spy(ctx, 'reload'));

			await target.evaluate(async (ctx) => {
				ctx.deactivate();

				await ctx.waitComponentStatus('inactive');

				ctx.activate();

				await ctx.waitComponentStatus('ready');
			});

			// We expect that the reload method will be called twice,
			// since we are going through two instances of `async` and `$async` in the array
			await test.expect(mockReload.callsCount).resolves.toBe(2);
		});
	});

	test.describe('reloadOnActivation = false', () => {
		test.beforeEach(async ({page}) => {
			target = await Component.createComponent(page, 'b-dummy', {
				dataProvider: 'Provider'
			});
		});

		test('should not reload the data on activation if the data is already loaded', async () => {
			await interceptor.respond();
			const mockReload = await createSpy(target, (ctx) => jestMock.spy(ctx, 'reload'));

			await target.evaluate(async (ctx) => {
				await ctx.waitComponentStatus('ready');

				ctx.deactivate();

				await ctx.waitComponentStatus('inactive');

				ctx.activate();

				await ctx.waitComponentStatus('ready');
			});

			await test.expect(mockReload.callsCount).resolves.toBe(0);
		});

		test('should continue the pending request after activation', async () => {
			const mockMuteRequest = await createSpy(target, (ctx) => jestMock.spy(ctx.unsafe.async, 'muteRequest'));

			await target.evaluate((ctx) => ctx.deactivate());
			await interceptor.respond();

			const isReadyOnceAfterDeactivate = await target.evaluate((ctx) => ctx.isReadyOnce);
			test.expect(isReadyOnceAfterDeactivate).toBe(false);

			await target.evaluate((ctx) => ctx.activate());

			const isReadyOnceAfterActivate = await target.evaluate((ctx) => ctx.isReadyOnce);
			test.expect(isReadyOnceAfterActivate).toBe(true);

			await test.expect(mockMuteRequest.calls).resolves.toEqual([]);
		});
	});

	test.describe('unloaded component', () => {
		test.beforeEach(async ({page}) => {
			target = await Component.createComponent(page, 'b-dummy', {
				dataProvider: 'Provider',
				activated: false
			});
		});

		test('should load the data on activation', async () => {
			const mockInitLoad = await createSpy(target, (ctx) => jestMock.spy(ctx, 'initLoad'));

			await target.evaluate((ctx) => ctx.activate());
			await interceptor.respond();

			await target.evaluate((ctx) => ctx.waitComponentStatus('ready'));

			await test.expect(mockInitLoad.callsCount).resolves.toBe(1);
		});

		test('should not reload the data after second activation', async () => {
			const mockReload = await createSpy(target, (ctx) => jestMock.spy(ctx, 'reload'));

			await target.evaluate((ctx) => ctx.activate());
			await interceptor.respond();

			await target.evaluate(async (ctx) => {
				await ctx.waitComponentStatus('ready');

				ctx.deactivate();

				await ctx.waitComponentStatus('inactive');

				ctx.activate();

				await ctx.waitComponentStatus('ready');
			});

			await test.expect(mockReload.callsCount).resolves.toBe(0);
		});

		test('should continue the pending request after second activation', async () => {
			const mockInitLoad = await createSpy(target, (ctx) => jestMock.spy(ctx.unsafe, 'initLoad'));

			await target.evaluate(async (ctx) => {
				ctx.activate();

				await ctx.unsafe.async.nextTick();

				ctx.deactivate();
			});

			await interceptor.respond();

			const isReadyOnceAfterDeactivate = await target.evaluate((ctx) => ctx.isReadyOnce);
			test.expect(isReadyOnceAfterDeactivate).toBe(false);

			await target.evaluate((ctx) => ctx.activate());

			const isReadyOnceAfterActivate = await target.evaluate((ctx) => ctx.isReadyOnce);
			test.expect(isReadyOnceAfterActivate).toBe(true);

			await test.expect(mockInitLoad.callsCount).resolves.toBe(1);
		});
	});
});
