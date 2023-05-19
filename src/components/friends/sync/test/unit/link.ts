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

test.describe('friends/sync `link`', () => {
	let target: JSHandle<bFriendsSyncDummy>;

	const componentName = 'b-friends-sync-dummy';

	test.beforeEach(async ({demoPage, page}) => {
		await demoPage.goto();
		await Component.waitForComponentTemplate(page, componentName);
		target = await Component.createComponent(page, componentName);
	});

	test.describe('via a decorator', () => {
		test('should create a link to the nested property of the field', async () => {
			const scan = await target.evaluate(async (ctx) => {
				const res = [ctx.linkToNestedField];

				ctx.dict.a!.b!++;
				await ctx.nextTick();
				res.push(ctx.linkToNestedField);

				ctx.dict.a!.b!++;
				await ctx.nextTick();
				res.push(ctx.linkToNestedField);

				ctx.dict.a = {e: 1};
				await ctx.nextTick();
				res.push(ctx.linkToNestedField);

				return res;
			});

			test.expect(scan).toEqual([2, 3, 4, undefined]);
		});

		test('should create a link to the nested property of the field with initialization function', async () => {
			const scan = await target.evaluate(async (ctx) => {
				const res = [ctx.linkToNestedFieldWithInitializer];

				ctx.dict.a!.b!++;
				await ctx.nextTick();
				res.push(ctx.linkToNestedFieldWithInitializer);

				ctx.dict.a!.b!++;
				await ctx.nextTick();
				res.push(ctx.linkToNestedFieldWithInitializer);

				ctx.dict.a = {e: 1};
				await ctx.nextTick();
				res.push(ctx.linkToNestedFieldWithInitializer);

				return res;
			});

			test.expect(scan).toEqual([3, 4, 5, NaN]);
		});

		test([
			'should create a link to the nested property of the field with initialization function',
			'using a @system decorator'
		].join(' '), async () => {
			const scan = await target.evaluate((ctx) => {
				const res = [ctx.immediateWithFlushSyncLinkToNestedFieldWithInitializerFromSystemToField];

				ctx.dict.a!.b!++;
				res.push(ctx.immediateWithFlushSyncLinkToNestedFieldWithInitializerFromSystemToField);

				ctx.dict.a!.b!++;
				res.push(ctx.immediateWithFlushSyncLinkToNestedFieldWithInitializerFromSystemToField);

				ctx.dict.a = {e: 1};
				res.push(ctx.immediateWithFlushSyncLinkToNestedFieldWithInitializerFromSystemToField);

				return res;
			});

			test.expect(scan).toEqual([3, 4, 5, NaN]);
		});
	});

	test.describe('via a direct call', () => {
		test('should create a link for the event', async () => {
			const scan = await target.evaluate((ctx) => {
				const res = [ctx.sync.link(['bla', 'localEmitter:foo'])];

				ctx.unsafe.localEmitter.emit('foo', 1);
				res.push(ctx.bla);

				ctx.unsafe.localEmitter.emit('foo', 2);
				res.push(ctx.bla);

				ctx.unsafe.localEmitter.emit('foo', 3);
				res.push(ctx.bla);

				return res;
			});

			test.expect(scan).toEqual([undefined, 1, 2, 3]);
		});

		test('should create a link for the event with initialization function', async () => {
			const scan = await target.evaluate((ctx) => {
				const res: any[] = [ctx.sync.link(['bla', 'localEmitter:foo'], (val: number) => val + 1)];

				ctx.unsafe.localEmitter.emit('foo', 1);
				res.push(ctx.bla);

				ctx.unsafe.localEmitter.emit('foo', 2);
				res.push(ctx.bla);

				ctx.unsafe.localEmitter.emit('foo', 3);
				res.push(ctx.bla);

				return res;
			});

			test.expect(scan).toEqual([NaN, 2, 3, 4]);
		});

		test('should create a link to the field', async () => {
			const scan = await target.evaluate(async (ctx) => {
				const res = [
					Object.fastClone(ctx.dict),
					Object.fastClone(ctx.sync.link(['bla', 'dict']))
				];

				ctx.dict.a!.b!++;
				await ctx.nextTick();
				res.push(Object.fastClone(ctx.bla));

				ctx.dict.a!.b!++;
				await ctx.nextTick();
				res.push(Object.fastClone(ctx.bla));

				ctx.dict.a = {e: 1};
				await ctx.nextTick();
				res.push(Object.fastClone(ctx.bla));

				return res;
			});

			test.expect(scan).toEqual([
				{a: {b: 2, c: 3}},
				{a: {b: 2, c: 3}},
				{a: {b: 3, c: 3}},
				{a: {b: 4, c: 3}},
				{a: {e: 1}}
			]);
		});

		test([
			'should create a link for the nested property of the field,',
			'which by default updates on the next tick'
		].join(' '), async () => {
			const scan = await target.evaluate(async (ctx) => {
				const res = [
					ctx.dict.a!.b!,
					ctx.sync.link(['bla', 'dict.a.b'])
				];

				ctx.dict.a!.b!++;
				await ctx.nextTick();
				res.push(ctx.bla);

				ctx.dict.a!.b!++;
				await ctx.nextTick();
				res.push(ctx.bla);

				ctx.dict.a = {e: 1};
				await ctx.nextTick();
				res.push(ctx.bla);

				return res;
			});

			test.expect(scan).toEqual([2, 2, 3, 4, undefined]);
		});

		test('should create a link to the nested property of the field with initialization function', async () => {
			const scan = await target.evaluate(async (ctx) => {
				const res: any[] = [
					ctx.dict.a!.b!,
					ctx.sync.link(['bla', 'dict.a.b'], (val: number) => val + 1)
				];

				ctx.dict.a!.b!++;
				await ctx.nextTick();
				res.push(ctx.bla);

				ctx.dict.a!.b!++;
				await ctx.nextTick();
				res.push(ctx.bla);

				ctx.dict.a = {e: 1};
				await ctx.nextTick();
				res.push(ctx.bla);

				return res;
			});

			test.expect(scan).toEqual([2, 3, 4, 5, NaN]);
		});

		test([
			'should create a link for the nested property of the field,',
			'which updates immediately when the `flush = sync` option is provided'
		].join(' '), async () => {
			const scan = await target.evaluate((ctx) => {
				const res = [
					Object.fastClone(ctx.dict.a!.b),
					Object.fastClone(ctx.sync.link(['bla', 'dict.a.b'], {flush: 'sync'}))
				];

				ctx.dict.a!.b!++;
				res.push(Object.fastClone(ctx.bla));

				ctx.dict.a!.b!++;
				res.push(Object.fastClone(ctx.bla));

				ctx.dict.a = {e: 1};
				res.push(Object.fastClone(ctx.bla));

				return res;
			});

			test.expect(scan).toEqual([2, 2, 3, 4, undefined]);
		});

		test([
			'should create a link for the mounted watcher',
			'when the path to this watcher is specified as the source'
		].join(' '), async () => {
			const scan = await target.evaluate(async (ctx) => {
				const res = [
					Object.fastClone(ctx.mountedWatcher),
					Object.fastClone(ctx.sync.link(['bla', 'mountedWatcher']))
				];

				ctx.mountedWatcher.a!.b!++;
				await ctx.nextTick();
				res.push(Object.fastClone(ctx.bla));

				ctx.mountedWatcher.a!.b!++;
				await ctx.nextTick();
				res.push(Object.fastClone(ctx.bla));

				ctx.mountedWatcher.a = {e: 1};
				await ctx.nextTick();
				res.push(Object.fastClone(ctx.bla));

				return res;
			});

			test.expect(scan).toEqual([
				{a: {b: 1}},
				{a: {b: 1}},
				{a: {b: 2}},
				{a: {b: 3}},
				{a: {e: 1}}
			]);
		});

		test([
			'should create a link for the mounted watcher',
			'when the JavaScript link to this watcher is specified as the source'
		].join(' '), async () => {
			const scan = await target.evaluate(async (ctx) => {
				const res = [
					Object.fastClone(ctx.mountedWatcher),
					Object.fastClone(ctx.sync.link(['bla', ctx.mountedWatcher]))
				];

				ctx.mountedWatcher.a!.b!++;
				await ctx.nextTick();
				res.push(Object.fastClone(ctx.bla));

				ctx.mountedWatcher.a!.b!++;
				await ctx.nextTick();
				res.push(Object.fastClone(ctx.bla));

				ctx.mountedWatcher.a = {e: 1};
				await ctx.nextTick();
				res.push(Object.fastClone(ctx.bla));

				return res;
			});

			test.expect(scan).toEqual([
				{a: {b: 1}},
				{a: {b: 1}},
				{a: {b: 2}},
				{a: {b: 3}},
				{a: {e: 1}}
			]);
		});

		test([
			'should create a link for the nested property in the mounted watcher',
			'when the path to this property is specified as the source'
		].join(' '), async () => {
			const scan = await target.evaluate(async (ctx) => {
				const res: any[] = [
					ctx.mountedWatcher.a!.b,
					ctx.sync.link(['bla', 'mountedWatcher.a.b'])
				];

				ctx.mountedWatcher.a!.b!++;
				await ctx.nextTick();
				res.push(ctx.bla);

				ctx.mountedWatcher.a!.b!++;
				await ctx.nextTick();
				res.push(ctx.bla);

				ctx.mountedWatcher.a = {e: 1};
				await ctx.nextTick();
				res.push(ctx.bla);

				return res;
			});

			test.expect(scan).toEqual([1, 1, 2, 3, undefined]);
		});

		test([
			'should create a link for the nested property in the mounted watcher',
			'when the JavaScript link to this property is specified as the source'
		].join(' '), async () => {
			const scan = await target.evaluate(async (ctx) => {
				const res: any[] = [
					Object.fastClone(ctx.mountedWatcher.a),
					Object.fastClone(ctx.sync.link(['bla', {ctx: ctx.mountedWatcher, path: 'a'}]))
				];

				ctx.mountedWatcher.a!.b!++;
				await ctx.nextTick();
				res.push(Object.fastClone(ctx.bla));

				ctx.mountedWatcher.a!.b!++;
				await ctx.nextTick();
				res.push(Object.fastClone(ctx.bla));

				ctx.mountedWatcher.a = {e: 1};
				await ctx.nextTick();
				res.push(Object.fastClone(ctx.bla));

				return res;
			});

			test.expect(scan).toEqual([{b: 1}, {b: 1}, {b: 2}, {b: 3}, {e: 1}]);
		});
	});
});
