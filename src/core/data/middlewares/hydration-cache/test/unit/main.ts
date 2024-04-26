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

import type bDummy from 'components/dummies/b-dummy/b-dummy';

test.describe('core/data/middlewares/hydration-cache', () => {
	let
		component: JSHandle<bDummy>;

	test.beforeEach(async ({page, demoPage}) => {
		await demoPage.goto();

		const provider = new RequestInterceptor(page, /api/);

		provider.response(200, {message: 'ok'});
		await provider.start();

		component = await Component.createComponent(page, 'b-dummy', {
			'data-id': 'target',
			dataProvider: 'test.HydrationCache'
		});

		await Component.waitForComponentStatus(page, '[data-id="target"]', 'ready');
	});

	test('should save the response to the hydration store', async () => {
		const response = await component.evaluate((ctx) => {
			if (ctx.dataProvider?.provider == null) {
				return;
			}

			const {provider} = ctx.dataProvider;

			return provider.params.remoteState?.hydrationStore.get(provider.cacheId);
		});

		await test.expect(Object.values(response)[0]).toEqual({message: 'ok'});
	});
});
