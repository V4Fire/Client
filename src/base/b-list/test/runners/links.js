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

	describe('b-list list with defined items with hrefs', () => {
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
			return h.component.waitForComponent(page, '#target');
		};

		it('providing of href-s manually', async () => {
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

			expect(
				await target.evaluate((ctx) => {
					ctx.block.elements('item')[1].querySelector(ctx.block.getElSelector('link')).click();
					return location.hash;
				})
			).toBe('#bla');
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

			expect(
				await target.evaluate((ctx) => {
					ctx.block.elements('item')[0].querySelector(ctx.block.getElSelector('link')).click();
					return location.hash;
				})
			).toBe('#foo');
		});
	});
};
