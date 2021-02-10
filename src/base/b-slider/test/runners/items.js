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

		it('loading items with an external itemProps as function', async () => {
			const
				items = [{id: 'foo'}, {id: 'bar'}, {id: 'baz'}],
				itemClass = h.dom.elNameGenerator('.b-slider', 'item');

			const target = await initSlider(page, {
				attrs: {
					item: 'b-checkbox',
					items,
					itemProps: 'return (el, i) => ({id: el.id + "_" + i})'
				}
			});

			const itemsCount = await target.evaluate(
				(ctx, name) => ctx.$el.querySelectorAll(name).length,
				itemClass
			);

			const getItem = (item, index) => target.evaluate(
				(ctx, {item, index}) => ctx.$el.querySelector(`#${item.id}_${index}`) != null,
				{item, index}
			);

			const
				results = await Promise.all(items.map(getItem));

			expect(results.every((v) => v)).toEqual(true);
			expect(itemsCount).toEqual(3);
		});

		it('loading items with an external itemProps as object', async () => {
			const
				items = [{id: 'foo'}, {id: 'bar'}, {id: 'baz'}];

			const target = await initSlider(page, {
				attrs: {
					item: 'b-checkbox',
					items,
					itemProps: {name: 'foo'}
				}
			});

			const namedCount = await target.evaluate(
				(ctx) => ctx.$el.querySelectorAll('[name="foo"]').length
			);

			expect(namedCount).toEqual(3);
		});
	});
};
