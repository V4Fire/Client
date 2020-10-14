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

	describe('b-list list with loading from a data provider', () => {
		const init = async (attrs = {}) => {
			await page.evaluate((attrs) => {
				const scheme = [
					{
						attrs: {
							id: 'target',
							...attrs
						}
					}
				];

				globalThis.renderComponents('b-list', scheme);
			}, attrs);

			await h.bom.waitForIdleCallback(page);
			await h.component.waitForComponentStatus(page, '#target', 'ready');
			return h.component.waitForComponent(page, '#target');
		};

		it('simple loading from a provider', async () => {
			const target = await init({
				autoHref: true,
				dataProvider: 'demo.List'
			});

			expect(
				await target.evaluate((ctx) => {
					ctx.block.elements('item')[1].querySelector(ctx.block.getElSelector('link')).click();
					return location.hash;
				})
			).toBe('#bar');
		});
	});
};
