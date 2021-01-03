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
	h = include('tests/helpers'),
	{initSlider} = include('src/base/b-slider/test/helpers');

/**
 * @param {Page} page
 */
module.exports = (page) => {
	beforeAll(async () => {
		await page.setViewportSize({width: 480, height: 640});
	});

	beforeEach(async () => {
		await page.evaluate(() => {
			globalThis.removeCreatedComponents();
		});
	});

	describe('b-slider renders items', () => {
		it('simple loading items from a provider', async () => {
			const
				itemClass = h.dom.elNameGenerator('.b-slider', 'item');

			const target = await initSlider(page, {
				attrs: {
					item: 'b-checkbox',
					dataProvider: 'demo.List'
				}
			});

			const
				itemsCount = await target.evaluate((ctx, name) => ctx.$el.querySelectorAll(name).length, itemClass),
				componentsCount = await target.evaluate((ctx) => ctx.$el.querySelectorAll('.b-checkbox').length);

			expect(itemsCount).toEqual(2);
			expect(itemsCount).toEqual(componentsCount);
		});

		it('loading items with external items iterator', async () => {
			const
				itemClass = h.dom.elNameGenerator('.b-slider', 'item');

			const target = await initSlider(page, {
				attrs: {
					item: 'b-checkbox',
					items: [],
					itemsIterator: 'return () => [{id: "1"}, {id: "2"}, {id: "3"}]'
				}
			});

			const itemsCount = await target.evaluate(
				(ctx, name) => ctx.$el.querySelectorAll(name).length, itemClass
			);

			expect(itemsCount).toEqual(3);
		});
	});
};
