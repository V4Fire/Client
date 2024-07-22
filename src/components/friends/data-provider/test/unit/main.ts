/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import test from 'tests/config/unit/test';
import { BOM, Component, RequestInterceptor } from 'tests/helpers';

import type bDummy from 'components/dummies/b-dummy/b-dummy';

test.describe('components/friends/data-provider', () => {
	let provider: RequestInterceptor;

	test.beforeEach(async ({demoPage, page}) => {
		await demoPage.goto();

		provider = new RequestInterceptor(page, /api/);

		provider.response(200, {message: 'ok'});
		await provider.start();
	});

	test('should cancel a request promise if the `waitPermissionToRequest` is not resolved', async ({page}) => {
		const component = await Component.createComponent<bDummy>(page, 'b-dummy', {
			attrs: {
				dataProvider: 'test.FriendsDataProvider'
			}
		});

		await component.evaluate((ctx) => {
			const originalWaitPermissionToRequest = ctx.waitPermissionToRequest.bind(ctx);

			ctx.waitPermissionToRequest = (...args) => {
				const p = originalWaitPermissionToRequest(...args);

				return ctx.unsafe.async.promise(new Promise((resolve) => setTimeout(() => resolve(p))), args[0]);
			};

			void ctx.dataProvider!.get(undefined, {group: 'friends-data-provider-test'});
			ctx.unsafe.async.clearAll({group: 'friends-data-provider-test'});
		});

		await BOM.waitForIdleCallback(page);

		test.expect(provider.calls).toHaveLength(1);
	});
});
