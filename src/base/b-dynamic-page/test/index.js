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

	beforeEach(async () => {
		await page.evaluate(() => {
			globalThis.removeCreatedComponents();
		});
	});

	describe('b-dynamic-page', () => {
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
