/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

// @ts-check

module.exports = async (page, {browserType, componentDir, tmpDir}) => {
	await page.screenshot({path: `${tmpDir}/example-${browserType}.png`});

	const
		cName = '.b-virtual-scroll',
		c = await (await page.$(cName)).getProperty('component')

	describe('b-virtual-scroll', () => {
		it('provides items to the chunk renderer', async () => {
			expect(await c.evaluate((ctx) => ctx.chunkRender.items.length)).toBe(100)
		});

		it('renders data chunks to the page', async () => {
			expect(await c.evaluate((ctx) => ctx.$refs.container.childElementCount)).toBe(10);

			await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
			await page.waitForFunction(`document.querySelector('${cName}__container').childElementCount > 10`);

			expect(await c.evaluate((ctx) => ctx.$refs.container.childElementCount)).toBe(20);
		});
	});
};
