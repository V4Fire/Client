/* eslint-disable max-lines,max-lines-per-function */

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

	test('checking the initial values', async () => {
		test.expect(
			await target.evaluate((ctx) => ({
				dict: Object.fastClone(ctx.dict),
				linkToNestedFieldWithInitializer: ctx.linkToNestedFieldWithInitializer,
				watchableObject: Object.fastClone(ctx.watchableObject)
			}))
		).toEqual({
			dict: {a: {b: 2, c: 3}},
			linkToNestedFieldWithInitializer: 3,
			watchableObject: {
				dict: {a: {b: 2, c: 3}},
				linkToNestedFieldWithInitializer: 6,
				linkToPath: 2,
				linkToPathWithInitializer: 6
			}
		});
	});

	test('changing some values', async () => {
		test.expect(
			await target.evaluate(async (ctx) => {
				ctx.dict.a.b++;
				ctx.dict.a.c++;
				await ctx.nextTick();

				return {
					dict: Object.fastClone(ctx.dict),
					linkToNestedFieldWithInitializer: ctx.linkToNestedFieldWithInitializer,
					watchableObject: Object.fastClone(ctx.watchableObject)
				};
			})
		).toEqual({
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

	test.describe('`syncLinks`', () => {
		test('global synchronization', async () => {
			const scan = await target.evaluate((ctx) => {
				const res = [
					Object.fastClone(ctx.dict),
					Object.fastClone(ctx.sync.link(['bla', 'dict'], {flush: 'sync'}))
				];

				ctx.dict.a.b++;
				res.push(Object.fastClone(ctx.bla));

				ctx.bla = {c: 1};
				res.push(Object.fastClone(ctx.bla));

				ctx.sync.syncLinks();
				res.push(Object.fastClone(ctx.bla));

				return res;
			});

			test.expect(scan).toEqual([
				{a: {b: 2, c: 3}},
				{a: {b: 2, c: 3}},
				{a: {b: 3, c: 3}},
				{c: 1},
				{a: {b: 3, c: 3}}
			]);
		});

		test('synchronization by a main name', async () => {
			const scan = await target.evaluate((ctx) => {
				const res = [
					Object.fastClone(ctx.dict),
					Object.fastClone(ctx.sync.link(['bla', 'dict'], {flush: 'sync'}))
				];

				ctx.dict.a.b++;
				res.push(Object.fastClone(ctx.bla));

				ctx.bla = {c: 1};
				res.push(Object.fastClone(ctx.bla));

				ctx.sync.syncLinks('dict');
				res.push(Object.fastClone(ctx.bla));

				return res;
			});

			test.expect(scan).toEqual([
				{a: {b: 2, c: 3}},
				{a: {b: 2, c: 3}},
				{a: {b: 3, c: 3}},
				{c: 1},
				{a: {b: 3, c: 3}}
			]);
		});

		test('synchronization by a link name', async () => {
			const scan = await target.evaluate((ctx) => {
				const res = [
					Object.fastClone(ctx.dict),
					Object.fastClone(ctx.sync.link(['bla', 'dict'], {immediate: true}))
				];

				ctx.dict.a.b++;
				res.push(Object.fastClone(ctx.bla));

				ctx.bla = {c: 1};
				res.push(Object.fastClone(ctx.bla));

				ctx.sync.syncLinks(['bla']);
				res.push(Object.fastClone(ctx.bla));

				ctx.bla = {c: 1};
				res.push(Object.fastClone(ctx.bla));

				ctx.sync.syncLinks(['bla', 'dict']);
				res.push(Object.fastClone(ctx.bla));

				return res;
			});

			test.expect(scan).toEqual([
				{a: {b: 2, c: 3}},
				{a: {b: 2, c: 3}},
				{a: {b: 3, c: 3}},
				{c: 1},
				{a: {b: 3, c: 3}},
				{c: 1},
				{a: {b: 3, c: 3}}
			]);
		});

		test('providing a value', async () => {
			const scan = await target.evaluate((ctx) => {
				const res = [
					Object.fastClone(ctx.dict),
					Object.fastClone(ctx.sync.link(['bla', 'dict'], {immediate: true}))
				];

				ctx.dict.a.b++;
				res.push(Object.fastClone(ctx.bla));

				ctx.bla = {c: 1};
				res.push(Object.fastClone(ctx.bla));

				ctx.sync.syncLinks('dict', {e: 1});
				res.push(Object.fastClone(ctx.bla));

				return res;
			});

			test.expect(scan).toEqual([
				{a: {b: 2, c: 3}},
				{a: {b: 2, c: 3}},
				{a: {b: 3, c: 3}},
				{c: 1},
				{e: 1}
			]);
		});
	});

	test.describe('`mod`', () => {
		test('checking the initial value', async () => {
			test.expect(await target.evaluate((ctx) => ctx.mods.foo)).toBe('bar');
		});

		test('changing the tied field', async () => {
			test.expect(await target.evaluate(async (ctx) => {
				ctx.dict.a.b++;
				await ctx.nextTick();
				return ctx.mods.foo;
			})).toBe('bla');
		});
	});
});
