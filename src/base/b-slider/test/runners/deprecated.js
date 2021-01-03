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
	const
		textSlotContent = 'Lorem Ipsum';

	beforeEach(async () => {
		await page.evaluate(() => {
			globalThis.removeCreatedComponents();
		});
	});

	describe('b-slider providing of slots', () => {
		it('"beforeOptions" slot', async () => {
			const
				w = h.dom.elNameGenerator('.b-slider', 'view-content');

			const target = await initSlider(page, {
				attrs: {
					option: 'b-checkbox',
					options: [{id: '1'}, {id: '2'}]
				},
				content: {
					beforeOptions: `return () => "${textSlotContent}"`
				}
			});

			const text = await target.evaluate(
				(ctx, selector) => ctx.$el.querySelector(selector).firstChild.wholeText.trim(), w
			);

			expect(text).toEqual(textSlotContent);
		});

		it('"afterOptions" slot', async () => {
			const
				w = h.dom.elNameGenerator('.b-slider', 'view-content');

			const target = await initSlider(page, {
				attrs: {
					option: 'b-checkbox',
					options: [{id: '1'}, {id: '2'}]
				},
				content: {
					afterOptions: `return () => "${textSlotContent}"`
				}
			});

			const text = await target.evaluate(
				(ctx, selector) => ctx.$el.querySelector(selector).lastChild.wholeText.trim(), w
			);

			expect(text).toEqual(textSlotContent);
		});

		it('simple loading items from a provider', async () => {
			const target = await initSlider(page, {
				attrs: {
					item: 'b-checkbox',
					dataProvider: 'demo.List'
				}
			});

			const
				itemsCount = await target.evaluate((ctx) => ctx.$el.querySelectorAll('.b-slider__option').length);

			expect(itemsCount).toEqual(2);
		});

		it('loading items with external options iterator', async () => {
			const
				itemClass = h.dom.elNameGenerator('.b-slider', 'option');

			const target = await initSlider(page, {
				attrs: {
					option: 'b-checkbox',
					options: [],
					optionsIterator: 'return () => [{id: "1"}, {id: "2"}, {id: "3"}]'
				}
			});

			const itemsCount = await target.evaluate(
				(ctx, name) => ctx.$el.querySelectorAll(name).length, itemClass
			);

			expect(itemsCount).toEqual(3);
		});
	});
};
