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

/** @param {Page} page */
module.exports = (page) => {
	beforeEach(async () => {
		await page.evaluate(() => {
			globalThis.removeCreatedComponents();
		});
	});

	describe('b-list loading from a data provider', () => {
		it('simple loading', async () => {
			const target = await init({
				autoHref: true,
				dataProvider: 'demo.List'
			});

			const selector = await target.evaluate((ctx) => {
				const classes = ctx.block.elements('item')[1].querySelector(ctx.block.getElSelector('link')).className;
				return `.${classes.split(' ').join('.')}`;
			});

			await page.click(selector);

			expect(await target.evaluate(() => location.hash)).toBe('#bar');
		});
	});

	async function init(attrs = {}) {
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

		await h.component.waitForComponentStatus(page, '#target', 'ready');
		return h.component.waitForComponent(page, '#target');
	}
};
