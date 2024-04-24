/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { JSHandle } from 'playwright';

import test from 'tests/config/unit/test';
import { Component } from 'tests/helpers';

import type bDummy from 'components/dummies/b-dummy/b-dummy';

test.describe('core/data/middlewares/hydration-cache', () => {
	let
		component: JSHandle<bDummy>;

	test.beforeEach(async ({page, demoPage}) => {
		await demoPage.goto();

		component = await Component.createComponent(
			page,
			'b-dummy',

			{
				'data-id': 'target',
				dataProvider: 'test.HydrationCache'
			}
		);

		await Component.waitForComponentStatus(page, '[data-id="target"]', 'ready');
	});

	test('should initialize the provider cache record in the hydration store', async () => {
		const record = await component.evaluate((ctx) => {
			const
				{cacheId, params} = ctx.dataProvider!.provider;

			return params.remoteState?.hydrationStore.get(cacheId);
		});

		await test.expect(record).toBeDefined();
	});
});
