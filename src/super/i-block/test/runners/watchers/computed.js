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
 * @param {Page} page
 */
module.exports = (page) => {
	beforeEach(async () => {
		await page.evaluate(() => {
			globalThis.removeCreatedComponents();
		});
	});

	describe('i-block watching for a getter', () => {
		it('that depends on an external property', async () => {
			const target = await init();

			const res = await target.evaluate(async (ctx) => {
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

			expect(res).toEqual(['b-dummy', false, true, true]);
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

			globalThis.renderComponents('b-dummy', scheme);
		}, attrs);

		return h.component.waitForComponent(page, '#target');
	}
};
