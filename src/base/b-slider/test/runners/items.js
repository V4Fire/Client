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
			const target = await initSlider(page, {
				attrs: {
					item: 'b-checkbox',
					dataProvider: 'demo.List'
				}
			});

			const
				itemsCount = await target.evaluate((ctx) => ctx.$el.querySelectorAll('.b-checkbox').length);

			expect(itemsCount).toEqual(2);
		});
	});
};
