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

/** @param {Page} page */
module.exports = (page) => {
	beforeEach(async () => {
		await page.evaluate(() => {
			globalThis.removeCreatedComponents();
		});
	});

	describe('i-block watching for computed fields', () => {
		it('that depends on an external property', async () => {
			const target = await init();

			const scan = await target.evaluate(async (ctx) => {
				ctx.r.isAuth = false;
				await ctx.nextTick();

				const
					res = [ctx.componentName, ctx.remoteWatchableGetter];

				ctx.watch('remoteWatchableGetter', (val) => {
					res.push(val);
				});

				ctx.r.isAuth = true;
				await ctx.nextTick();
				res.push(ctx.remoteWatchableGetter);

				return res;
			});

			expect(scan).toEqual(['b-dummy-watch', false, true, true]);
		});

		it('non-deep watching', async () => {
			const
				target = await init();

			const scan = await target.evaluate(async (ctx) => {
				ctx.r.isAuth = false;
				await ctx.nextTick();

				const
					res = [];

				ctx.watch('smartComputed', (val, ...args) => {
					res.push([
						Object.fastClone(val),
						Object.fastClone(args[0]),
						args[1].path,
						args[1].originalPath
					]);
				});

				ctx.complexObjStore = {a: {b: {c: 3}}};
				ctx.systemComplexObjStore = {a: {b: {c: 2}}};
				await ctx.nextTick();

				ctx.r.isAuth = true;
				await ctx.nextTick();

				ctx.complexObjStore.a.b.c++;
				ctx.complexObjStore.a.b.c++;
				await ctx.nextTick();

				return res;
			});

			expect(scan).toEqual([
				[
					{a: {b: {c: 3}}, b: 12, remoteWatchableGetter: false},
					undefined,
					['smartComputed'],
					['complexObjStore']
				],

				[
					{a: {b: {c: 3}}, b: 12, remoteWatchableGetter: true},
					{a: {b: {c: 3}}, b: 12, remoteWatchableGetter: false},
					['smartComputed'],
					['isAuth']
				],

				[
					{a: {b: {c: 5}}, b: 12, remoteWatchableGetter: true},
					{a: {b: {c: 3}}, b: 12, remoteWatchableGetter: true},
					['smartComputed'],
					['complexObjStore', 'a', 'b', 'c']
				]
			]);
		});
	});

	async function init(attrs = {}) {
		await page.evaluate((attrs = {}) => {
			const scheme = [
				{
					attrs: {
						id: 'target',
						...attrs
					}
				}
			];

			globalThis.renderComponents('b-dummy-watch', scheme);
		}, attrs);

		return h.component.waitForComponent(page, '#target');
	}
};
