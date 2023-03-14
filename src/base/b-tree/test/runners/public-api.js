// @ts-check

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * @typedef {import('playwright').Page} Page
 */

const
	h = include('tests/helpers').default;

/**
 * Starts a test
 *
 * @param {Page} page
 * @returns {!Promise<void>}
 */
module.exports = (page) => {
	beforeEach(async () => {
		await page.evaluate(() => {
			globalThis.removeCreatedComponents();
		});
	});

	describe('b-tree public API.', () => {
		const items = [
			{value: 0},
			{value: 1},
			{
				value: 2,
				children: [
					{
						value: 4,
						children: [{value: 5}]
					}
				]
			},
			{value: 3}
		];

		it('traverse', async () => {
			const
				target = await init();

			expect(
				await target.evaluate((ctx) => [...ctx.traverse()].map(([item]) => item.value))

			).toEqual([0, 1, 2, 3, 4, 5]);

			expect(
				await target.evaluate((ctx) => [...ctx.traverse(ctx, {deep: false})].map(([item]) => item.value))

			).toEqual([0, 1, 2, 3]);
		});

		it('fold/unfold', async () => {
			const
				target = await init();

			await target.evaluate((ctx) => ctx.unfold());

			const
				el1 = await page.locator('[data-id="2"]'),
				el2 = await page.locator('[data-id="4"]');

			expect([
				(await el1.getAttribute('class')).includes('folded_false'),
				(await el2.getAttribute('class')).includes('folded_true')
			]).toEqual([true, true]);

			await target.evaluate((ctx) => ctx.fold());

			expect([
				(await el1.getAttribute('class')).includes('folded_true'),
				(await el2.getAttribute('class')).includes('folded_true')
			]).toEqual([true, true]);
		});

		it('all parent are unfolded if unfold nested item', async () => {
			const
				target = await init();

			await target.evaluate((ctx) => ctx.unfold(5));

			const
				el1 = await page.locator('[data-id="2"]'),
				el2 = await page.locator('[data-id="4"]');

			expect([
				(await el1.getAttribute('class')).includes('folded_false'),
				(await el2.getAttribute('class')).includes('folded_false')
			]).toEqual([true, true]);
		});

		async function init() {
			await page.evaluate((items) => {
				const scheme = [
					{
						attrs: {
							items,
							id: 'target',
							theme: 'demo'
						}
					}
				];

				globalThis.renderComponents('b-tree', scheme);
			}, items);

			await h.component.waitForComponentStatus(page, '#target', 'ready');
			return h.component.waitForComponent(page, '#target');
		}
	});
};
