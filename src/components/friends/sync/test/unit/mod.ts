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

import type bFriendsSyncDummy from 'components/friends/sync/test/b-friends-sync-dummy/b-friends-sync-dummy';

test.describe('friends/sync `mod`', () => {
	let target: JSHandle<bFriendsSyncDummy>;

	const componentName = 'b-friends-sync-dummy';

	test.beforeEach(async ({demoPage, page}) => {
		await demoPage.goto();
		await Component.waitForComponentTemplate(page, componentName);
		target = await Component.createComponent(page, componentName);
	});

	test('initial value of the modifier should by synced to the source', async () => {
		await test.expect(target.evaluate((ctx) => ctx.mods.foo)).toBeResolvedTo('bar');
	});

	test('modifier should be updated when the source has changed', async () => {
		await test.expect(target.evaluate(async (ctx) => {
			ctx.dict.a!.b!++;
			await ctx.nextTick();
			return ctx.mods.foo;
		})).toBeResolvedTo('bla');
	});
});
