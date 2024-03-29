/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { JSHandle } from 'playwright';

import test from 'tests/config/unit/test';

import { renderDummy } from 'components/super/i-block/test/helpers';

import type bDummy from 'components/dummies/b-dummy/b-dummy';

test.describe('core/component/event', () => {
	let target: JSHandle<bDummy>;

	test.beforeEach(async ({demoPage, page}) => {
		await demoPage.goto();
		target = await renderDummy(page);
	});

	test('adding an event handler using the $on method should be done using $async', async () => {
		const isWrapped = await target.evaluate((ctx) => {
			ctx.unsafe.$on('$onTest', () => {
				// ...
			});

			return Object.get(ctx, '$async.cache.eventListener.groups.$onTest') != null;
		});

		test.expect(isWrapped).toBe(true);
	});

	test('adding an event handler using the $once method should be done using $async', async () => {
		const isWrapped = await target.evaluate((ctx) => {
			ctx.unsafe.$once('$onTest', () => {
				// ...
			});

			return Object.get(ctx, '$async.cache.eventListener.groups.$onTest') != null;
		});

		test.expect(isWrapped).toBe(true);
	});
});
