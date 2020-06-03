/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */


const
	path = require('upath'),
	pzlr = require('@pzlr/build-core');

const
	componentDir = pzlr.resolve.blockSync('b-virtual-scroll'),
	h = require(path.join(componentDir, 'test/helpers.js'));

module.exports = async (page, {componentSelector, component: c}) => {
	describe('b-virtual-scroll', () => {
		it('has empty slot', async () => {
			expect(await c.evaluate((ctx) => Boolean(ctx.vdom.getSlot('empty')))).toBe(true);
		});

		it('renders empty slot to the page', async () => {
			await h.waitForRefDisplay(page, componentSelector, 'tombstones', 'none');
			await h.waitForRefDisplay(page, componentSelector, 'empty', '');

			expect(await c.evaluate((ctx) => ctx.$refs.empty.style.display)).toBe('');
		});

		it('does not render empty slot to the page if contains data', async () => {
			const
				secondComponentSelector = `.b-virtual-scroll#second`,
				{component: secondCtx} = await h.getComponentCtx(page, secondComponentSelector);

			await h.waitForRefDisplay(page, secondComponentSelector, 'tombstones', 'none', componentSelector);
			await h.waitItemsCountGreaterThan(page, 0, secondComponentSelector, '>', componentSelector);

			expect(await secondCtx.evaluate((ctx) => ctx.$refs.container.childElementCount)).toBeGreaterThan(0);
			expect(await secondCtx.evaluate((ctx) => ctx.$refs.empty.style.display)).toBe('none');
		});
	});
};
