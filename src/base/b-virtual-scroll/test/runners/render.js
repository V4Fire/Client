/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

// @ts-check

module.exports = async (page, {componentSelector, component}) => {
	describe('b-virtual-scroll', () => {
		it('renders data chunks to the page', async () => {
			await page.waitForFunction(`document.querySelector('${componentSelector}__container').childElementCount > 0`);
			expect(await component.evaluate((ctx) => ctx.$refs.container.childElementCount)).toBeGreaterThan(0);

			await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
			await page.waitForFunction(`document.querySelector('${componentSelector}__container').childElementCount > 10`);
			expect(await component.evaluate((ctx) => ctx.$refs.container.childElementCount)).toBe(20);
		});
	});
};
