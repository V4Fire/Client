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

/** @param {Page} page */
module.exports = (page) => {
	beforeEach(async () => {
		await page.evaluate(() => {
			globalThis.removeCreatedComponents();
		});
	});

	describe('b-list providing items with hrefs', () => {
		it('providing a list with href-s', async () => {
			const target = await init({
				items: [
					{
						label: 'Foo',
						href: '#foo'
					},

					{
						label: 'Bla',
						href: '#bla'
					}
				]
			});

			const selector = await target.evaluate((ctx) => {
				const classes = ctx.block.elements('item')[1].querySelector(ctx.block.getElSelector('link')).className;
				return `.${classes.split(' ').join('.')}`;
			});

			await page.click(selector);

			expect(await target.evaluate(() => location.hash)).toBe('#bla');
		});

		it('generation of href-s', async () => {
			const target = await init({
				autoHref: true,

				items: [
					{
						label: 'Foo',
						value: '#foo'
					},

					{
						label: 'Bla',
						value: '#bla'
					}
				]
			});

			const selector = await target.evaluate((ctx) => {
				const classes = ctx.block.elements('item')[0].querySelector(ctx.block.getElSelector('link')).className;
				return `.${classes.split(' ').join('.')}`;
			});

			await page.click(selector);

			expect(await target.evaluate(() => location.hash)).toBe('#foo');
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

		return h.component.waitForComponent(page, '#target');
	}
};
