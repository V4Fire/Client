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

	test.describe('`link`', () => {
		test.describe('by using a decorator', () => {
			test('linking to a nested field', async () => {
				const scan = await target.evaluate(async (ctx) => {
					const res = [ctx.linkToNestedField];

					ctx.dict.a.b++;
					await ctx.nextTick();
					res.push(ctx.linkToNestedField);

					ctx.dict.a.b++;
					await ctx.nextTick();
					res.push(ctx.linkToNestedField);

					ctx.dict.a = {e: 1};
					await ctx.nextTick();
					res.push(ctx.linkToNestedField);

					return res;
				});

				test.expect(scan).toEqual([2, 3, 4, undefined]);
			});

			test('linking to a nested field with an initializer', async () => {
				const scan = await target.evaluate(async (ctx) => {
					const res = [ctx.linkToNestedFieldWithInitializer];

					ctx.dict.a.b++;
					await ctx.nextTick();
					res.push(ctx.linkToNestedFieldWithInitializer);

					ctx.dict.a.b++;
					await ctx.nextTick();
					res.push(ctx.linkToNestedFieldWithInitializer);

					ctx.dict.a = {e: 1};
					await ctx.nextTick();
					res.push(ctx.linkToNestedFieldWithInitializer);

					return res;
				});

				test.expect(scan).toEqual([3, 4, 5, NaN]);
			});

			test('immediate linking to a nested field with an initializer from @system to @field', async () => {
				const scan = await target.evaluate((ctx) => {
					const res = [ctx.immediateWithFlushSyncLinkToNestedFieldWithInitializerFromSystemToField];

					ctx.dict.a.b++;
					res.push(ctx.immediateWithFlushSyncLinkToNestedFieldWithInitializerFromSystemToField);

					ctx.dict.a.b++;
					res.push(ctx.immediateWithFlushSyncLinkToNestedFieldWithInitializerFromSystemToField);

					ctx.dict.a = {e: 1};
					res.push(ctx.immediateWithFlushSyncLinkToNestedFieldWithInitializerFromSystemToField);

					return res;
				});

				test.expect(scan).toEqual([3, 4, 5, NaN]);
			});
		});

		test.describe('without using a decorator', () => {
			test('linking to an event', async () => {
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

			test('linking to an event with an initializer', async () => {
				const scan = await target.evaluate((ctx) => {
					const res = [ctx.sync.link(['bla', 'localEmitter:foo'], (val) => val + 1)];

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

			test('linking to a field', async () => {
				const scan = await target.evaluate(async (ctx) => {
					const res = [
						Object.fastClone(ctx.dict),
						Object.fastClone(ctx.sync.link(['bla', 'dict']))
					];

					ctx.dict.a.b++;
					await ctx.nextTick();
					res.push(Object.fastClone(ctx.bla));

					ctx.dict.a.b++;
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

			test('immediate linking to a field', async () => {
				const scan = await target.evaluate((ctx) => {
					const res = [
						Object.fastClone(ctx.dict),
						Object.fastClone(ctx.sync.link(['bla', 'dict']))
					];

					ctx.dict.a.b++;
					res.push(Object.fastClone(ctx.bla));

					ctx.dict.a.b++;
					res.push(Object.fastClone(ctx.bla));

					ctx.dict.a = {e: 1};
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

			test('linking to a nested field', async () => {
				const scan = await target.evaluate(async (ctx) => {
					const res = [
						ctx.dict.a.b,
						ctx.sync.link(['bla', 'dict.a.b'])
					];

					ctx.dict.a.b++;
					await ctx.nextTick();
					res.push(ctx.bla);

					ctx.dict.a.b++;
					await ctx.nextTick();
					res.push(ctx.bla);

					ctx.dict.a = {e: 1};
					await ctx.nextTick();
					res.push(ctx.bla);

					return res;
				});

				test.expect(scan).toEqual([2, 2, 3, 4, undefined]);
			});

			test('linking to a nested field with an initializer', async () => {
				const scan = await target.evaluate(async (ctx) => {
					const res = [
						ctx.dict.a.b,
						ctx.sync.link(['bla', 'dict.a.b'], (val) => val + 1)
					];

					ctx.dict.a.b++;
					await ctx.nextTick();
					res.push(ctx.bla);

					ctx.dict.a.b++;
					await ctx.nextTick();
					res.push(ctx.bla);

					ctx.dict.a = {e: 1};
					await ctx.nextTick();
					res.push(ctx.bla);

					return res;
				});

				test.expect(scan).toEqual([2, 3, 4, 5, NaN]);
			});

			test('linking to a field from the mounted watcher passed by a path', async () => {
				const scan = await target.evaluate(async (ctx) => {
					const res = [
						Object.fastClone(ctx.mountedWatcher),
						Object.fastClone(ctx.sync.link(['bla', 'mountedWatcher']))
					];

					ctx.mountedWatcher.a.b++;
					await ctx.nextTick();
					res.push(Object.fastClone(ctx.bla));

					ctx.mountedWatcher.a.b++;
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

			test('linking to a field from the mounted watcher passed by a link', async () => {
				const scan = await target.evaluate(async (ctx) => {
					const res = [
						Object.fastClone(ctx.mountedWatcher),
						Object.fastClone(ctx.sync.link(['bla', ctx.mountedWatcher]))
					];

					ctx.mountedWatcher.a.b++;
					await ctx.nextTick();
					res.push(Object.fastClone(ctx.bla));

					ctx.mountedWatcher.a.b++;
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

			test('linking to a nested field from the mounted watcher passed by a path', async () => {
				const scan = await target.evaluate(async (ctx) => {
					const res = [
						ctx.mountedWatcher.a.b,
						ctx.sync.link(['bla', 'mountedWatcher.a.b'])
					];

					ctx.mountedWatcher.a.b++;
					await ctx.nextTick();
					res.push(ctx.bla);

					ctx.mountedWatcher.a.b++;
					await ctx.nextTick();
					res.push(ctx.bla);

					ctx.mountedWatcher.a = {e: 1};
					await ctx.nextTick();
					res.push(ctx.bla);

					return res;
				});

				test.expect(scan).toEqual([1, 1, 2, 3, undefined]);
			});

			test('linking to a nested field from the mounted watcher passed by a link', async () => {
				const scan = await target.evaluate(async (ctx) => {
					const res = [
						Object.fastClone(ctx.mountedWatcher.a),
						Object.fastClone(ctx.sync.link(['bla', {ctx: ctx.mountedWatcher, path: 'a'}]))
					];

					ctx.mountedWatcher.a.b++;
					await ctx.nextTick();
					res.push(Object.fastClone(ctx.bla));

					ctx.mountedWatcher.a.b++;
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

	test.describe('`object`', () => {
		test.describe('without using a decorator', () => {
			test('linking to an event', async () => {
				const scan = await target.evaluate((ctx) => {
					const res = [Object.fastClone(ctx.sync.object('bla', [['foo', 'localEmitter:foo']]))];

					ctx.unsafe.localEmitter.emit('foo', 1);
					res.push(Object.fastClone(ctx.bla));

					ctx.unsafe.localEmitter.emit('foo', 2);
					res.push(Object.fastClone(ctx.bla));

					ctx.unsafe.localEmitter.emit('foo', 3);
					res.push(Object.fastClone(ctx.bla));

					ctx.unsafe.localEmitter.emit('foo', undefined);
					res.push(Object.fastClone(ctx.bla));

					return res;
				});

				test.expect(scan).toEqual([{foo: undefined}, {foo: 1}, {foo: 2}, {foo: 3}, {foo: undefined}]);
			});

			test('linking to an event with an initializer', async () => {
				const scan = await target.evaluate((ctx) => {
					const res = [Object.fastClone(ctx.sync.object('bla', [['foo', 'localEmitter:foo', (val) => val + 1]]))];

					ctx.unsafe.localEmitter.emit('foo', 1);
					res.push(Object.fastClone(ctx.bla));

					ctx.unsafe.localEmitter.emit('foo', 2);
					res.push(Object.fastClone(ctx.bla));

					ctx.unsafe.localEmitter.emit('foo', 3);
					res.push(Object.fastClone(ctx.bla));

					ctx.unsafe.localEmitter.emit('foo', undefined);
					res.push(Object.fastClone(ctx.bla));

					return res;
				});

				test.expect(scan).toEqual([{foo: NaN}, {foo: 2}, {foo: 3}, {foo: 4}, {foo: NaN}]);
			});

			test('linking to a field', async () => {
				const scan = await target.evaluate(async (ctx) => {
					const res = [
						Object.fastClone(ctx.dict),
						Object.fastClone(ctx.sync.object('bla', ['dict']))
					];

					ctx.dict.a.b++;
					await ctx.nextTick();
					res.push(Object.fastClone(ctx.bla));

					ctx.dict.a.b++;
					await ctx.nextTick();
					res.push(Object.fastClone(ctx.bla));

					ctx.dict.a = {e: 1};
					await ctx.nextTick();
					res.push(Object.fastClone(ctx.bla));

					return res;
				});

				test.expect(scan).toEqual([
					{a: {b: 2, c: 3}},
					{dict: {a: {b: 2, c: 3}}},
					{dict: {a: {b: 3, c: 3}}},
					{dict: {a: {b: 4, c: 3}}},
					{dict: {a: {e: 1}}}
				]);
			});

			test('linking to a nested field', async () => {
				const scan = await target.evaluate(async (ctx) => {
					const res = [
						ctx.dict.a.b,
						Object.fastClone(ctx.sync.object('bla', [['foo', 'dict.a.b']]))
					];

					ctx.dict.a.b++;
					await ctx.nextTick();
					res.push(Object.fastClone(ctx.bla));

					ctx.dict.a.b++;
					await ctx.nextTick();
					res.push(Object.fastClone(ctx.bla));

					ctx.dict.a = {e: 1};
					await ctx.nextTick();
					res.push(Object.fastClone(ctx.bla));

					return res;
				});

				test.expect(scan).toEqual([2, {foo: 2}, {foo: 3}, {foo: 4}, {foo: undefined}]);
			});

			test('immediate linking to a nested field', async () => {
				const scan = await target.evaluate((ctx) => {
					const res = [
						ctx.dict.a.b,
						Object.fastClone(ctx.sync.object('bla', {flush: 'sync'}, [['foo', 'dict.a.b']]))
					];

					ctx.dict.a.b++;
					res.push(Object.fastClone(ctx.bla));

					ctx.dict.a.b++;
					res.push(Object.fastClone(ctx.bla));

					ctx.dict.a = {e: 1};
					res.push(Object.fastClone(ctx.bla));

					return res;
				});

				test.expect(scan).toEqual([2, {foo: 2}, {foo: 3}, {foo: 4}, {foo: undefined}]);
			});

			test('linking to a nested field with an initializer', async () => {
				const scan = await target.evaluate(async (ctx) => {
					const res = [
						ctx.dict.a.b,
						ctx.sync.object('bla.bar', [['foo', 'dict.a.b', (val) => val + 1]])
					];

					ctx.dict.a.b++;
					await ctx.nextTick();
					res.push(Object.fastClone(ctx.bla));

					ctx.dict.a.b++;
					await ctx.nextTick();
					res.push(Object.fastClone(ctx.bla));

					ctx.dict.a = {e: 1};
					await ctx.nextTick();
					res.push(Object.fastClone(ctx.bla));

					return res;
				});

				test.expect(scan).toEqual([
					2,
					{bar: {foo: NaN}},
					{bar: {foo: 4}},
					{bar: {foo: 5}},
					{bar: {foo: NaN}}
				]);
			});

			test('checking `r.isAuth`', async () => {
				const scan = await target.evaluate(async (ctx) => {
					const
						res = [Object.isBoolean(ctx.r.isAuth)];

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

			test('linking to a field from the mounted watcher passed by a path', async () => {
				const scan = await target.evaluate(async (ctx) => {
					const res = [
						Object.fastClone(ctx.mountedWatcher),
						Object.fastClone(ctx.sync.object('bla', [['bla', 'mountedWatcher']]))
					];

					ctx.mountedWatcher.a.b++;
					await ctx.nextTick();
					res.push(Object.fastClone(ctx.bla));

					ctx.mountedWatcher.a.b++;
					await ctx.nextTick();
					res.push(Object.fastClone(ctx.bla));

					ctx.mountedWatcher.a = {e: 1};
					await ctx.nextTick();
					res.push(Object.fastClone(ctx.bla));

					return res;
				});

				test.expect(scan).toEqual([
					{a: {b: 1}},
					{bla: {a: {b: 1}}},
					{bla: {a: {b: 2}}},
					{bla: {a: {b: 3}}},
					{bla: {a: {e: 1}}}
				]);
			});

			test('linking to a field from the mounted watcher passed by a link', async () => {
				const scan = await target.evaluate(async (ctx) => {
					const res = [
						Object.fastClone(ctx.mountedWatcher),
						Object.fastClone(ctx.sync.object('bla', [['bla', ctx.mountedWatcher]]))
					];

					ctx.mountedWatcher.a.b++;
					await ctx.nextTick();
					res.push(Object.fastClone(ctx.bla));

					ctx.mountedWatcher.a.b++;
					await ctx.nextTick();
					res.push(Object.fastClone(ctx.bla));

					ctx.mountedWatcher.a = {e: 1};
					await ctx.nextTick();
					res.push(Object.fastClone(ctx.bla));

					return res;
				});

				test.expect(scan).toEqual([
					{a: {b: 1}},
					{bla: {a: {b: 1}}},
					{bla: {a: {b: 2}}},
					{bla: {a: {b: 3}}},
					{bla: {a: {e: 1}}}
				]);
			});

			test('linking to a nested field from the mounted watcher passed by a path', async () => {
				const scan = await target.evaluate(async (ctx) => {
					const res = [
						ctx.mountedWatcher.a.b,
						Object.fastClone(ctx.sync.object('bla', [['bla', 'mountedWatcher.a.b']]))
					];

					ctx.mountedWatcher.a.b++;
					await ctx.nextTick();
					res.push(Object.fastClone(ctx.bla));

					ctx.mountedWatcher.a.b++;
					await ctx.nextTick();
					res.push(Object.fastClone(ctx.bla));

					ctx.mountedWatcher.a = {e: 1};
					await ctx.nextTick();
					res.push(Object.fastClone(ctx.bla));

					return res;
				});

				test.expect(scan).toEqual([1, {bla: 1}, {bla: 2}, {bla: 3}, {bla: undefined}]);
			});

			test('linking to a nested field from the mounted watcher passed by a link', async () => {
				const scan = await target.evaluate(async (ctx) => {
					const res = [
						Object.fastClone(ctx.mountedWatcher.a),
						Object.fastClone(ctx.sync.object('bla', [['bla', {ctx: ctx.mountedWatcher, path: 'a'}]]))
					];

					ctx.mountedWatcher.a.b++;
					await ctx.nextTick();
					res.push(Object.fastClone(ctx.bla));

					ctx.mountedWatcher.a.b++;
					await ctx.nextTick();
					res.push(Object.fastClone(ctx.bla));

					ctx.mountedWatcher.a = {e: 1};
					await ctx.nextTick();
					res.push(Object.fastClone(ctx.bla));

					return res;
				});

				test.expect(scan).toEqual([
					{b: 1},
					{bla: {b: 1}},
					{bla: {b: 2}},
					{bla: {b: 3}},
					{bla: {e: 1}}
				]);
			});
		});
	});

	test.describe('`syncLinks`', () => {
		// FIXME: broken test
		test('global synchronization', async () => {
			const scan = await target.evaluate((ctx) => {
				const res = [
					Object.fastClone(ctx.dict),
					Object.fastClone(ctx.sync.link(['bla', 'dict'], {immediate: true}))
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

		// FIXME: broken test
		test('synchronization by a main name', async () => {
			const scan = await target.evaluate((ctx) => {
				const res = [
					Object.fastClone(ctx.dict),
					Object.fastClone(ctx.sync.link(['bla', 'dict'], {immediate: true}))
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

		// FIXME: broken test
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

		// FIXME: broken test
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
