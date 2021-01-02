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
	{swipeOnce, initSlider} = include('src/base/b-slider/test/helpers');

/**
 * @param {Page} page
 */
module.exports = (page) => {
	const
		textSlotContent = 'Lorem Ipsum';

	beforeAll(async () => {
		await page.setViewportSize({width: 480, height: 640});
	});

	beforeEach(async () => {
		await page.evaluate(() => {
			globalThis.removeCreatedComponents();
		});
	});

	describe('b-slider providing of slots', () => {
		it('"afterItems" slot', async () => {
			const
				w = h.dom.elNameGenerator('.b-slider', 'view-content');

			const target = await initSlider(page, {
				attrs: {
					item: 'b-checkbox',
					items: [{id: '1'}, {id: '2'}]
				},
				content: {
					afterItems: `return () => "${textSlotContent}"`
				}
			});

			const text = await target.evaluate(
				(ctx, selector) => ctx.$el.querySelector(selector).lastChild.wholeText.trim(), w
			);

			expect(text).toEqual(textSlotContent);
		});
	});
};
