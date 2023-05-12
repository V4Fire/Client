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

test.describe('friends/sync', () => {

	let target: JSHandle<bFriendsSyncDummy>;

	const componentName = 'b-friends-sync-dummy';

	test.beforeEach(async ({demoPage, page}) => {
		await demoPage.goto();
		await Component.waitForComponentTemplate(page, componentName);
		target = await Component.createComponent(page, componentName);
	});

	test('linked field should be correctly initialized', async () => {
		const scan = await target.evaluate(({dict}) => ({
			dict: Object.fastClone(dict)
		}));

		test.expect(scan).toEqual({
			dict: {a: {b: 2, c: 3}}
		});
	});

	test('fields with `init` option should be correctly initialized', async () => {
		const scan = await target.evaluate(({linkToNestedFieldWithInitializer, watchableObject}) => ({
			linkToNestedFieldWithInitializer,
			watchableObject: Object.fastClone(watchableObject)
		}));

		test.expect(scan).toEqual({
			linkToNestedFieldWithInitializer: 3,
			watchableObject: {
				dict: {a: {b: 2, c: 3}},
				linkToNestedFieldWithInitializer: 6,
				linkToPath: 2,
				linkToPathWithInitializer: 6
			}
		});
	});

	test('fields synced to `dict` field should be updated after this field has changed', async () => {
		const scan = await target.evaluate(async (ctx) => {
			ctx.dict.a!.b!++;
			ctx.dict.a!.c!++;
			await ctx.nextTick();

			const {linkToNestedFieldWithInitializer} = ctx;

			return {
				dict: Object.fastClone(ctx.dict),
				linkToNestedFieldWithInitializer,
				watchableObject: Object.fastClone(ctx.watchableObject)
			};
		});

		test.expect(scan).toEqual({
			dict: {a: {b: 3, c: 4}},
			linkToNestedFieldWithInitializer: 4,
			watchableObject: {
				dict: {a: {b: 3, c: 4}},
				linkToNestedFieldWithInitializer: 8,
				linkToPath: 3,
				linkToPathWithInitializer: 8
			}
		});
	});

	test('`r.isAuth` should by synced to `remoteState.isAuth`', async () => {
		const scan = await target.evaluate(async (ctx) => {
			const res = [Object.isBoolean(ctx.r.isAuth)];

			ctx.r.remoteState.isAuth = true;
			await ctx.nextTick();
			res.push(ctx.r.isAuth);

			ctx.r.remoteState.isAuth = false;
			await ctx.nextTick();
			res.push(ctx.r.isAuth);

			return res;
		});

		test.expect(scan).toEqual([
			true,
			true,
			false
		]);
	});
});
