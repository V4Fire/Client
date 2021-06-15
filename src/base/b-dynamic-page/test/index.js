/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

// @ts-check
/* eslint-disable max-lines-per-function */

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

	beforeEach(async () => {
		await page.evaluate(() => {
			globalThis.removeCreatedComponents();
		});
	});

	describe('b-dynamic-page', () => {
		it("the `component` getter shouldn't be cached", async () => {
			const target = await init({
				page: 'p-v4-dynamic-page-1'
			});

			expect(
				await target.evaluate((ctx) => {
					const {meta} = ctx;
					return 'component' in meta.accessors && !('component' in meta.computedFields);
				})
			).toBeTrue();
		});

		it('setting `pageProp` and `page`', async () => {
			const target = await init({
				page: 'p-v4-dynamic-page-1'
			});

			const scan = await target.evaluate(async (ctx) => {
				const
					res = [];

				await ctx.nextTick();
				res.push(ctx.page, ctx.component.componentName);

				ctx.page = 'p-v4-dynamic-page-2';

				await ctx.nextTick();
				res.push(ctx.page, ctx.component.componentName);

				return res;
			});

			expect(scan).toEqual([
				'p-v4-dynamic-page-1',
				'p-v4-dynamic-page-1',

				'p-v4-dynamic-page-2',
				'p-v4-dynamic-page-2'
			]);
		});

		it('switching between pages', async () => {
			const
				target = await init();

			expect(await target.evaluate(switcher)).toEqual([
				'p-v4-dynamic-page-1',
				'mounted',

				'p-v4-dynamic-page-2',
				'mounted',

				'// Previous component',
				'destroyed',
				'destroyed',
				'destroyed',

				'p-v4-dynamic-page-1',
				'mounted',

				'// Previous component',
				'destroyed',
				'destroyed',
				'destroyed'
			]);
		});

		describe('providing `keep-alive`', () => {
			it('switching between pages', async () => {
				const target = await init({
					keepAlive: true
				});

				expect(await target.evaluate(switcher)).toEqual([
					'p-v4-dynamic-page-1',
					'activated',

					'p-v4-dynamic-page-2',
					'activated',

					'// Previous component',
					'deactivated',
					'deactivated',
					'mounted',

					'p-v4-dynamic-page-1',
					'activated',

					'// Previous component',
					'deactivated',
					'deactivated',
					'mounted'
				]);
			});

			it('switching between pages with providing `keepAliveSize`', async () => {
				const target = await init({
					keepAlive: true,
					keepAliveSize: 1
				});

				expect(
					await target.evaluate(async (ctx) => {
						const
							res = [];

						await ctx.router.push('page3');

						const
							prev = ctx.component;

						res.push(ctx.component.componentName);
						res.push(ctx.component.hook);

						await ctx.router.push('page1');
						await ctx.router.push('page2');

						res.push(prev.componentName);
						res.push(prev.hook);

						return res;
					})
				).toEqual([
					'p-v4-dynamic-page-3',
					'activated',

					'p-v4-dynamic-page-3',
					'destroyed'
				]);
			});

			describe('providing `include`', () => {
				it('as a string', async () => {
					const target = await init({
						keepAlive: true,
						include: 'p-v4-dynamic-page-1'
					});

					expect(await target.evaluate(switcher)).toEqual([
						'p-v4-dynamic-page-1',
						'activated',

						'p-v4-dynamic-page-2',
						'mounted',

						'// Previous component',
						'deactivated',
						'deactivated',
						'mounted',

						'p-v4-dynamic-page-1',
						'activated',

						'// Previous component',
						'destroyed',
						'destroyed',
						'destroyed'
					]);
				});

				it('as a string array', async () => {
					const target = await init({
						keepAlive: true,
						include: ['p-v4-dynamic-page-1', 'p-v4-dynamic-page-2']
					});

					expect(await target.evaluate(switcher)).toEqual([
						'p-v4-dynamic-page-1',
						'activated',

						'p-v4-dynamic-page-2',
						'activated',

						'// Previous component',
						'deactivated',
						'deactivated',
						'mounted',

						'p-v4-dynamic-page-1',
						'activated',

						'// Previous component',
						'deactivated',
						'deactivated',
						'mounted'
					]);
				});

				it('as a regular expression', async () => {
					const target = await init({
						keepAlive: true,
						include: 'return /^p-v4-dynamic-page/'
					});

					expect(await target.evaluate(switcher)).toEqual([
						'p-v4-dynamic-page-1',
						'activated',

						'p-v4-dynamic-page-2',
						'activated',

						'// Previous component',
						'deactivated',
						'deactivated',
						'mounted',

						'p-v4-dynamic-page-1',
						'activated',

						'// Previous component',
						'deactivated',
						'deactivated',
						'mounted'
					]);
				});

				it('as a function that returns `null` or `false`', async () => {
					const res = [
						'p-v4-dynamic-page-1',
						'mounted',

						'p-v4-dynamic-page-2',
						'mounted',

						'// Previous component',
						'destroyed',
						'destroyed',
						'destroyed',

						'p-v4-dynamic-page-1',
						'mounted',

						'// Previous component',
						'destroyed',
						'destroyed',
						'destroyed'
					];

					{
						const target = await init({
							keepAlive: true,
							include: 'return () => null'
						});

						expect(await target.evaluate(switcher)).toEqual(res);
					}

					{
						const target = await init({
							keepAlive: true,
							include: 'return () => false'
						});

						expect(await target.evaluate(switcher)).toEqual(res);
					}
				});

				it('as a function that returns `true` or a string', async () => {
					const res = [
						'p-v4-dynamic-page-1',
						'activated',

						'p-v4-dynamic-page-2',
						'activated',

						'// Previous component',
						'deactivated',
						'deactivated',
						'mounted',

						'p-v4-dynamic-page-1',
						'activated',

						'// Previous component',
						'deactivated',
						'deactivated',
						'mounted'
					];

					{
						const target = await init({
							keepAlive: true,
							include: 'return () => true'
						});

						expect(await target.evaluate(switcher)).toEqual(res);
					}

					{
						const target = await init({
							keepAlive: true,
							include: 'return (page) => page'
						});

						expect(await target.evaluate(switcher)).toEqual(res);
					}
				});

				it('as a function that returns the cache strategy', async () => {
					const include = `
return (page, route, ctx) => ({
	cacheKey: page,
	cacheGroup: page,
	createCache: () => ctx.keepAliveCache.global
})`;

					const target = await init({
						keepAlive: true,
						include
					});

					expect(await target.evaluate(switcher)).toEqual([
						'p-v4-dynamic-page-1',
						'activated',

						'p-v4-dynamic-page-2',
						'activated',

						'// Previous component',
						'deactivated',
						'deactivated',
						'mounted',

						'p-v4-dynamic-page-1',
						'activated',

						'// Previous component',
						'deactivated',
						'deactivated',
						'mounted'
					]);
				});
			});

			describe('providing `exclude`', () => {
				it('as a string', async () => {
					const target = await init({
						keepAlive: true,
						exclude: 'p-v4-dynamic-page-1'
					});

					expect(await target.evaluate(switcher)).toEqual([
						'p-v4-dynamic-page-1',
						'mounted',

						'p-v4-dynamic-page-2',
						'activated',

						'// Previous component',
						'destroyed',
						'destroyed',
						'destroyed',

						'p-v4-dynamic-page-1',
						'mounted',

						'// Previous component',
						'deactivated',
						'deactivated',
						'mounted'
					]);
				});

				it('as a string array', async () => {
					const target = await init({
						keepAlive: true,
						exclude: ['p-v4-dynamic-page-1', 'p-v4-dynamic-page-2']
					});

					expect(await target.evaluate(switcher)).toEqual([
						'p-v4-dynamic-page-1',
						'mounted',

						'p-v4-dynamic-page-2',
						'mounted',

						'// Previous component',
						'destroyed',
						'destroyed',
						'destroyed',

						'p-v4-dynamic-page-1',
						'mounted',

						'// Previous component',
						'destroyed',
						'destroyed',
						'destroyed'
					]);
				});

				it('as a regular expression', async () => {
					const target = await init({
						keepAlive: true,
						exclude: 'return /^p-v4-dynamic-page/'
					});

					expect(await target.evaluate(switcher)).toEqual([
						'p-v4-dynamic-page-1',
						'mounted',

						'p-v4-dynamic-page-2',
						'mounted',

						'// Previous component',
						'destroyed',
						'destroyed',
						'destroyed',

						'p-v4-dynamic-page-1',
						'mounted',

						'// Previous component',
						'destroyed',
						'destroyed',
						'destroyed'
					]);
				});

				it('as a function that returns `true`', async () => {
					const target = await init({
						keepAlive: true,
						exclude: 'return () => true'
					});

					expect(await target.evaluate(switcher)).toEqual([
						'p-v4-dynamic-page-1',
						'mounted',

						'p-v4-dynamic-page-2',
						'mounted',

						'// Previous component',
						'destroyed',
						'destroyed',
						'destroyed',

						'p-v4-dynamic-page-1',
						'mounted',

						'// Previous component',
						'destroyed',
						'destroyed',
						'destroyed'
					]);
				});

				it('as a function that returns `false`', async () => {
					const target = await init({
						keepAlive: true,
						exclude: 'return () => false'
					});

					expect(await target.evaluate(switcher)).toEqual([
						'p-v4-dynamic-page-1',
						'activated',

						'p-v4-dynamic-page-2',
						'activated',

						'// Previous component',
						'deactivated',
						'deactivated',
						'mounted',

						'p-v4-dynamic-page-1',
						'activated',

						'// Previous component',
						'deactivated',
						'deactivated',
						'mounted'
					]);
				});
			});

			describe('providing `include` and `exclude`', () => {
				it('`include` as a regular expression and `exclude` as a string', async () => {
					const target = await init({
						keepAlive: true,
						include: 'return /p-v4-dynamic-page/',
						exclude: 'p-v4-dynamic-page-2'
					});

					expect(await target.evaluate(switcher)).toEqual([
						'p-v4-dynamic-page-1',
						'activated',

						'p-v4-dynamic-page-2',
						'mounted',

						'// Previous component',
						'deactivated',
						'deactivated',
						'mounted',

						'p-v4-dynamic-page-1',
						'activated',

						'// Previous component',
						'destroyed',
						'destroyed',
						'destroyed'
					]);
				});
			});
		});

		async function switcher(ctx) {
			const
				res = [];

			let
				prev;

			await ctx.router.push('page3');
			await ctx.router.push('page1');

			res.push(ctx.component.componentName);
			res.push(ctx.component.hook);

			prev = ctx.component;
			await ctx.router.push('page2');

			res.push(ctx.component.componentName);
			res.push(ctx.component.hook);

			res.push('// Previous component');
			res.push(prev.hook);
			res.push(prev.block.element('button').component.hook);
			res.push(prev.block.element('button-func').component.hook);

			prev = ctx.component;
			await ctx.router.push('page1');

			res.push(ctx.component.componentName);
			res.push(ctx.component.hook);

			res.push('// Previous component');
			res.push(prev.hook);
			res.push(prev.block.element('button').component.hook);
			res.push(prev.block.element('button-func').component.hook);

			return res;
		}

		async function init(attrs = {}) {
			await page.evaluate((attrs) => {
				globalThis.removeCreatedComponents();

				globalThis.renderComponents('b-router', [
					{
						attrs: {
							routes: {
								page1: {
									path: '/page-1',
									component: 'p-v4-dynamic-page-1'
								},

								page2: {
									path: '/page-2',
									component: 'p-v4-dynamic-page-2'
								},

								page3: {
									path: '/page-3',
									component: 'p-v4-dynamic-page-3'
								}
							}
						}
					}
				]);

				Object.forEach(attrs, (el, key) => {
					// eslint-disable-next-line no-new-func
					attrs[key] = /return /.test(el) ? Function(el)() : el;
				});

				globalThis.renderComponents('b-dynamic-page', [
					{
						attrs: {
							id: 'target',
							...attrs
						}
					}
				]);
			}, attrs);

			return h.component.waitForComponent(page, '#target');
		}
	});
};
