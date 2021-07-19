/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

// @ts-check

/**
 * @typedef {import('playwright').Page} Page
 */

const
	h = include('tests/helpers');

/**
 * Starts a test
 *
 * @param {Page} page
 * @param {!Object} params
 * @returns {!Promise<void>}
 */
module.exports = async (page, params) => {
	await h.utils.setup(page, params.context);

	let
		target;

	beforeEach(async () => {
		await page.evaluate(() => {
			const scheme = [
				{
					attrs: {
						id: 'target'
					}
				}
			];

			globalThis.renderComponents('b-dummy-sync', scheme);
		});

		target = await h.component.waitForComponent(page, '#target');
	});

	afterEach(async () => {
		await page.evaluate(() => {
			globalThis.removeCreatedComponents();
		});
	});

	describe('`iBlock.sync`', () => {
		it('checking the initial values', async () => {
			expect(
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

		it('changing some values', async () => {
			expect(
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

		describe('link', () => {
			describe('by using a decorator', () => {
				it('linking to a nested field', async () => {
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

					expect(scan).toEqual([2, 3, 4, undefined]);
				});

				it('linking to a nested field with an initializer', async () => {
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

					expect(scan).toEqual([3, 4, 5, NaN]);
				});

				it('immediate linking to a nested field with an initializer from @system to @field', async () => {
					const scan = await target.evaluate((ctx) => {
						const res = [ctx.immediateLinkToNestedFieldWithInitializerFromSystemToField];

						ctx.dict.a.b++;
						res.push(ctx.immediateLinkToNestedFieldWithInitializerFromSystemToField);

						ctx.dict.a.b++;
						res.push(ctx.immediateLinkToNestedFieldWithInitializerFromSystemToField);

						ctx.dict.a = {e: 1};
						res.push(ctx.immediateLinkToNestedFieldWithInitializerFromSystemToField);

						return res;
					});

					expect(scan).toEqual([3, 4, 5, NaN]);
				});
			});

			describe('without using a decorator', () => {
				it('linking to a field', async () => {
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

					expect(scan).toEqual([
						{a: {b: 2, c: 3}},
						{a: {b: 2, c: 3}},
						{a: {b: 3, c: 3}},
						{a: {b: 4, c: 3}},
						{a: {e: 1}}
					]);
				});

				it('linking to a nested field', async () => {
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

					expect(scan).toEqual([2, 2, 3, 4, undefined]);
				});

				it('linking to a nested field with an initializer', async () => {
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

					expect(scan).toEqual([2, 3, 4, 5, NaN]);
				});

				it('linking to a field from the mounted watcher passed by a path', async () => {
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

					expect(scan).toEqual([
						{a: {b: 1}},
						{a: {b: 1}},
						{a: {b: 2}},
						{a: {b: 3}},
						{a: {e: 1}}
					]);
				});

				it('linking to a field from the mounted watcher passed by a link', async () => {
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

					expect(scan).toEqual([
						{a: {b: 1}},
						{a: {b: 1}},
						{a: {b: 2}},
						{a: {b: 3}},
						{a: {e: 1}}
					]);
				});

				it('linking to a nested field from the mounted watcher passed by a path', async () => {
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

					expect(scan).toEqual([1, 1, 2, 3, undefined]);
				});

				it('linking to a nested field from the mounted watcher passed by a link', async () => {
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

					expect(scan).toEqual([{b: 1}, {b: 1}, {b: 2}, {b: 3}, {e: 1}]);
				});
			});
		});

		describe('object', () => {
			describe('without using a decorator', () => {
				it('linking to a field', async () => {
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

					expect(scan).toEqual([
						{a: {b: 2, c: 3}},
						{dict: {a: {b: 2, c: 3}}},
						{dict: {a: {b: 3, c: 3}}},
						{dict: {a: {b: 4, c: 3}}},
						{dict: {a: {e: 1}}}
					]);
				});

				it('linking to a nested field', async () => {
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

					expect(scan).toEqual([2, {foo: 2}, {foo: 3}, {foo: 4}, {foo: 4}]);
				});

				it('linking to a nested field with an initializer', async () => {
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

					expect(scan).toEqual([
						2,
						{bar: {foo: 3}},
						{bar: {foo: 4}},
						{bar: {foo: 5}},
						{bar: {foo: null}}
					]);
				});

				it('linking to a field from the mounted watcher passed by a path', async () => {
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

					expect(scan).toEqual([
						{a: {b: 1}},
						{bla: {a: {b: 1}}},
						{bla: {a: {b: 2}}},
						{bla: {a: {b: 3}}},
						{bla: {a: {e: 1}}}
					]);
				});

				it('linking to a field from the mounted watcher passed by a link', async () => {
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

					expect(scan).toEqual([
						{a: {b: 1}},
						{bla: {a: {b: 1}}},
						{bla: {a: {b: 2}}},
						{bla: {a: {b: 3}}},
						{bla: {a: {e: 1}}}
					]);
				});

				it('linking to a nested field from the mounted watcher passed by a path', async () => {
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

					expect(scan).toEqual([1, {bla: 1}, {bla: 2}, {bla: 3}, {bla: 3}]);
				});

				it('linking to a nested field from the mounted watcher passed by a link', async () => {
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

					expect(scan).toEqual([
						{b: 1},
						{bla: {b: 1}},
						{bla: {b: 2}},
						{bla: {b: 3}},
						{bla: {e: 1}}
					]);
				});
			});
		});
	});
};
