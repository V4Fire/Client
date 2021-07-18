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
		describe('link', () => {
			describe('by using a decorator', () => {
				it('linking to the nested fields', async () => {
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

				it('linking to the nested fields with a initializer', async () => {
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

				it('immediate linking to the nested fields with a initializer from @system to @field', async () => {
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
				it('linking to the nested fields', async () => {
					const scan = await target.evaluate(async (ctx) => {
						const res = [ctx.sync.link(['bla', 'dict.a.b'])];

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

				it('linking to the nested fields with a initializer', async () => {
					const scan = await target.evaluate(async (ctx) => {
						const res = [ctx.sync.link(['bla', 'dict.a.b'], {collapse: false}, (val) => val + 1)];

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

					expect(scan).toEqual([3, 4, 5, NaN]);
				});

				it('linking to the mounted watcher', async () => {
					const scan = await target.evaluate(async (ctx) => {
						const res = [ctx.sync.link(['bla', 'mountedWatcher.a.b'])];

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

					expect(scan).toEqual([1, 2, 3, undefined]);
				});
			});
		});

		/*it('checking the initial values', async () => {
			expect(
				await target.evaluate((ctx) => ({
					dict: ctx.dict,
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
				await target.evaluate((ctx) => {
					ctx.dict.a.b++;
					ctx.dict.a.c++;

					return {
						dict: ctx.dict,
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
		});*/
	});
};
