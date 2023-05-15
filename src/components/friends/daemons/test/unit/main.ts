/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { Page, JSHandle } from 'playwright';

import test from 'tests/config/unit/test';

import { BOM, Component } from 'tests/helpers';

import type bFriendsDaemonsDummy from 'components/friends/daemons/test/b-friends-daemons-dummy/b-friends-daemons-dummy';

test.describe('friends/daemons', () => {
	let target: JSHandle<bFriendsDaemonsDummy>;

	test.beforeEach(async ({demoPage, page}) => {
		await demoPage.goto();
		await Component.waitForComponentTemplate(page, 'b-friends-daemons-dummy');
		target = await Component.createComponent(page, 'b-friends-daemons-dummy');
	});

	test.describe('should be executed on hooks', () => {
		test('`created`', async ({page}) => {
			await assertDaemonFlagValue(page, 'created', true);
		});

		test('`mounted`', async ({page}) => {
			await assertDaemonFlagValue(page, 'mounted', true);
		});
	});

	test('should be executed on field change', async ({page}) => {
		await assertDaemonFlagValue(page, 'fieldUpdate', undefined);

		await target.evaluate((ctx) => {
			ctx.testField = 2;
		});

		await BOM.waitForIdleCallback(page);

		await assertDaemonFlagValue(page, 'fieldUpdate', true);
	});

	test('should be executed when `run` is invoked', async ({page}) => {
		await target.evaluate((ctx) => {
			ctx.unsafe.daemons.run('executable');
		});

		await assertDaemonFlagValue(page, 'executable', true);
	});

	/**
	 * Asserts that a specific daemon has set the specified value
	 *
	 * @param page
	 * @param flag
	 * @param value
	 */
	async function assertDaemonFlagValue(page: Page, flag: string, value: unknown) {
		await test.expect(page.evaluate((flag) => globalThis.daemonsTest[flag], flag))
			.resolves.toBe(value);
	}
});
