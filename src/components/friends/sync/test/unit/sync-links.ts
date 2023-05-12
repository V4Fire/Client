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

test.describe('friends/sync `syncLinks`', () => {

	let target: JSHandle<bFriendsSyncDummy>;

	const componentName = 'b-friends-sync-dummy';

	test.beforeEach(async ({demoPage, page}) => {
		await demoPage.goto();
		await Component.waitForComponentTemplate(page, componentName);
		target = await Component.createComponent(page, componentName);
	});

	test('should sync all links without arguments', async () => {
		const scan = await target.evaluate((ctx) => {
			const res: Dictionary = {
				initial: [
					Object.fastClone(ctx.dict),
					Object.fastClone(ctx.sync.link(['bla', 'dict'], {flush: 'sync'})),
					Object.fastClone(ctx.sync.link(['bar', 'dict'], {flush: 'sync'}))
				]
			};

			const values = () => [Object.fastClone(ctx.bla), Object.fastClone(ctx.bar)];

			ctx.dict.a!.b!++;
			res.synced = values();

			ctx.bla = {c: 1};
			ctx.bar = {d: 1};
			res.modified = values();

			ctx.sync.syncLinks();
			res.reset = values();

			return res;
		});

		test.expect(scan).toEqual({
			initial: [{a: {b: 2, c: 3}}, {a: {b: 2, c: 3}}, {a: {b: 2, c: 3}}],
			synced: [{a: {b: 3, c: 3}}, {a: {b: 3, c: 3}}],
			modified: [{c: 1}, {d: 1}],
			reset: [{a: {b: 3, c: 3}}, {a: {b: 3, c: 3}}]
		});
	});

	test('should sync links of the specified source when source name is passed as an argument', async () => {
		const scan = await target.evaluate((ctx) => {
			const res: Dictionary = {
				initial: [
					Object.fastClone(ctx.dict),
					Object.fastClone(ctx.sync.link(['bla', 'dict'], {flush: 'sync'})),
					Object.fastClone(ctx.sync.link(['bar', 'foo'], {flush: 'sync'}))
				]
			};

			const values = () => [Object.fastClone(ctx.bla), Object.fastClone(ctx.bar)];

			ctx.dict.a!.b!++;
			ctx.foo = 1;
			res.synced = values();

			ctx.bla = {c: 1};
			ctx.bar = {d: 1};
			res.modified = values();

			ctx.sync.syncLinks('dict');
			res.reset = values();

			return res;
		});

		test.expect(scan).toEqual({
			initial: [{a: {b: 2, c: 3}}, {a: {b: 2, c: 3}}, undefined],
			synced: [{a: {b: 3, c: 3}}, 1],
			modified: [{c: 1}, {d: 1}],
			reset: [{a: {b: 3, c: 3}}, {d: 1}]
		});
	});

	test([
		'should sync only specific links of the specified source',
		'when link or/and source name is passed as an argument'
	].join(' '), async () => {
		const scan = await target.evaluate((ctx) => {
			const res: Dictionary = {
				initial: [
					Object.fastClone(ctx.dict),
					Object.fastClone(ctx.sync.link(['bla', 'dict'], {flush: 'sync'})),
					Object.fastClone(ctx.sync.link(['bar', 'dict'], {flush: 'sync'}))
				]
			};

			const values = () => [Object.fastClone(ctx.bla), Object.fastClone(ctx.bar)];

			ctx.dict.a!.b!++;
			res.synced = values();

			ctx.bla = {c: 1};
			ctx.bar = {d: 1};
			res.modified1 = values();

			ctx.sync.syncLinks(['bla']);
			res.reset1 = values();

			ctx.bla = {c: 1};
			ctx.bar = {d: 2};
			res.modified2 = values();

			ctx.sync.syncLinks(['bla', 'dict']);
			res.reset2 = values();

			return res;
		});

		test.expect(scan).toEqual({
			initial: [{a: {b: 2, c: 3}}, {a: {b: 2, c: 3}}, {a: {b: 2, c: 3}}],
			synced: [{a: {b: 3, c: 3}}, {a: {b: 3, c: 3}}],
			modified1: [{c: 1}, {d: 1}],
			reset1: [{a: {b: 3, c: 3}}, {d: 1}],
			modified2: [{c: 1}, {d: 2}],
			reset2: [{a: {b: 3, c: 3}}, {d: 2}]
		});
	});

	test('should sync links of the specified source to the provided value', async () => {
		const scan = await target.evaluate((ctx) => {
			const res: Dictionary = {
				initial: [
					Object.fastClone(ctx.dict),
					Object.fastClone(ctx.sync.link(['bla', 'dict'], {immediate: true}))
				]
			};

			ctx.dict.a!.b!++;
			res.synced = [Object.fastClone(ctx.bla)];

			ctx.bla = {c: 1};
			res.modified = [Object.fastClone(ctx.bla)];

			ctx.sync.syncLinks('dict', {e: 1});
			res.reset = [Object.fastClone(ctx.dict), Object.fastClone(ctx.bla)];

			return res;
		});

		test.expect(scan).toEqual({
			initial: [{a: {b: 2, c: 3}}, {a: {b: 2, c: 3}}],
			synced: [{a: {b: 3, c: 3}}],
			modified: [{c: 1}],
			reset: [{a: {b: 3, c: 3}}, {e: 1}]
		});
	});
});
