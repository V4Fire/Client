/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

// @ts-check

const
	path = require('upath'),
	pzlr = require('@pzlr/build-core');

const
	componentDir = pzlr.resolve.blockSync('b-virtual-scroll'),
	helpers = require(path.join(componentDir, 'test/helpers.js'));

const
	N = Number;

module.exports = async (page, {componentSelector, component}) => {
	describe('b-virtual-scroll', () => {
		it('renders truncated data chunks to the page', async () => {
			await page.setViewportSize({width: 640, height: 480});

			await helpers.waitItemsCountGreaterThan(page, 0, componentSelector);
			expect(await component.evaluate((ctx) => ctx.$refs.container.childElementCount)).toBe(6);

			await helpers.scrollAndWaitItemsCountGreaterThan(page, 6, componentSelector);
			expect(await component.evaluate((ctx) => ctx.$refs.container.childElementCount)).toBeGreaterThan(6);

			await helpers.scrollAndWaitItemsCountGreaterThan(page, 12, componentSelector);
			expect(await component.evaluate((ctx) => ctx.$refs.container.childElementCount)).toBeGreaterThan(12);

			await helpers.waitItemsCountGreaterThan(page, 24, componentSelector, '===')
			expect(await component.evaluate((ctx) => ctx.chunkRequest.pendingData.length)).toBe(0);
			expect(await component.evaluate((ctx) => ctx.$refs.container.childElementCount)).toBe(24);

			expect(await component.evaluate((ctx) => Number(ctx.$refs.container.children[0].getAttribute('data-index')))).toBe(0);
			expect(await component.evaluate((ctx) => Number(ctx.$refs.container.children[3].getAttribute('data-index')))).toBe(3);
			expect(await component.evaluate((ctx) => Number(ctx.$refs.container.children[6].getAttribute('data-index')))).toBe(6);
			expect(await component.evaluate((ctx) => Number(ctx.$refs.container.children[12].getAttribute('data-index')))).toBe(12);
			expect(await component.evaluate((ctx) => Number(ctx.$refs.container.children[15].getAttribute('data-index')))).toBe(15);
			expect(await component.evaluate((ctx) => Number(ctx.$refs.container.children[20].getAttribute('data-index')))).toBe(20);
			expect(await component.evaluate((ctx) => Number(ctx.$refs.container.children[23].getAttribute('data-index')))).toBe(23);

		});
	});
};
