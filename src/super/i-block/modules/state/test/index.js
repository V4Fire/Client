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

	describe('`iBlock.state`', () => {
		it('initialization without providing `globalName`', async () => {
			let
				target = await init();

			expect(
				await target.evaluate((ctx) => ({
					systemField: ctx.systemField,
					regularField: ctx.regularField,
					'mods.foo': ctx.mods.foo
				}))
			).toEqual({
				systemField: 'foo',
				regularField: undefined,
				'mods.foo': undefined
			});

			await target.evaluate(async (ctx) => {
				ctx.systemField = 'bar';
				await ctx.nextTick();

				ctx.regularField = 10;
				await ctx.nextTick();

				ctx.setMod('foo', 'bla');
				await ctx.nextTick();

				globalThis.removeCreatedComponents();
			});

			target = await init();

			expect(
				await target.evaluate((ctx) => ({
					systemField: ctx.systemField,
					regularField: ctx.regularField,
					'mods.foo': ctx.mods.foo
				}))
			).toEqual({
				systemField: 'foo',
				regularField: undefined,
				'mods.foo': undefined
			});
		});

		it('initialization with providing `globalName`', async () => {
			const
				globalName = Math.random();

			let target = await init({
				globalName
			});

			expect(
				await target.evaluate((ctx) => ({
					systemField: ctx.systemField,
					regularField: ctx.regularField,
					'mods.foo': ctx.mods.foo
				}))
			).toEqual({
				systemField: 'foo',
				regularField: 0,
				'mods.foo': undefined
			});

			await target.evaluate(async (ctx) => {
				ctx.systemField = 'bar';
				await ctx.nextTick();

				ctx.regularField = 10;
				await ctx.nextTick();

				ctx.setMod('foo', 'bla');
				await ctx.nextTick();

				globalThis.removeCreatedComponents();
			});

			target = await init({
				globalName
			});

			expect(
				await target.evaluate((ctx) => ({
					systemField: ctx.systemField,
					regularField: ctx.regularField,
					'mods.foo': ctx.mods.foo
				}))
			).toEqual({
				systemField: 'bar',
				regularField: 10,
				'mods.foo': 'bla'
			});

			expect(
				await target.evaluate(async (ctx) => {
					await ctx.state.resetStorage();

					return {
						systemField: ctx.systemField,
						regularField: ctx.regularField,
						'mods.foo': ctx.mods.foo
					};
				})
			).toEqual({
				systemField: 'foo',
				regularField: 0,
				'mods.foo': undefined
			});
		});
	});

	async function init(attrs = {}) {
		await page.evaluate((attrs) => {
			const scheme = [
				{
					attrs: {
						id: 'target',
						...attrs
					}
				}
			];

			globalThis.renderComponents('b-dummy-state', scheme);
		}, attrs);

		return h.component.waitForComponent(page, '#target');
	}
};
