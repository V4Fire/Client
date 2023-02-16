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
				el1 = await page.waitForSelector('[data-id="2"]', {state: 'attached'}),
				el2 = await page.waitForSelector('[data-id="4"]', {state: 'attached'});

			expect([
				(await el1.getAttribute('class')).includes('folded_false'),
				(await el2.getAttribute('class')).includes('folded_true')
			]).toEqual([true, true]);

			await target.evaluate((ctx) => ctx.fold());

			const
				el3 = await page.waitForSelector('[data-id="2"]', {state: 'attached'}),
				el4 = await page.waitForSelector('[data-id="4"]', {state: 'attached'});

			expect([
				(await el3.getAttribute('class')).includes('folded_true'),
				(await el4.getAttribute('class')).includes('folded_true')
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
