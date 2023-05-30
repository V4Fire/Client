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

test.describe('<i-block> modules - activation', () => {
	let target: JSHandle<bDummy>;

	test.beforeEach(async ({demoPage, page}) => {
		await demoPage.goto();
		target = await renderDummy(page);
	});

	test.describe('events', () => {
		// FIXME: event listener is muted on component deactivation
		// @see src/components/super/i-block/modules/activation/index.ts:229
		test.skip('should emit `hook:deactivated` event when `deactivate` is invoked', async () => {
			const eventPromise = target.evaluate((ctx) => new Promise((resolve) => {
				ctx.once('hook:deactivated', resolve);
				ctx.deactivate();
			}));

			await test.expect(eventPromise).toBeResolved();
		});

		test('should emit `hook:activated` event when `activate` is invoked', async () => {
			const eventPromise = target.evaluate((ctx) => new Promise((resolve) => {
				ctx.once('hook:activated', resolve);
				ctx.deactivate();
				ctx.activate();
			}));

			await test.expect(eventPromise).toBeResolved();
		});
	});
});
