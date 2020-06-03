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

module.exports = async (p, {componentSelector, component: c, components}) => {
	describe('b-virtual-scroll', () => {
		it('reloads data with initLoad', async () => {
			const chunkSize = await c.evaluate((ctx) => ctx.chunkSize);

			c.evaluate((ctx) => ctx.initLoad());
			await h.waitForRefDisplay(p, componentSelector, 'tombstones', '');
			await h.waitForRefDisplay(p, componentSelector, 'tombstones', 'none');

			expect(await c.evaluate((ctx) => ctx.$refs.tombstones.style.display)).toBe('none');
			expect(await c.evaluate((ctx) => ctx.$refs.container.style.display)).toBe('');
			expect(await c.evaluate((ctx) => ctx.$refs.container.childElementCount)).toBe(chunkSize);
		});

		const
			secondComponent = components[1],
			secondComponentSelector = `${componentSelector}#second`;

		const
			reloadCount = 6;

		it('reloads data with frequent initLoad calls', async () => {
			let i = reloadCount;

			while (i--) {
				secondComponent.evaluate((ctx) => ctx.initLoad());
				await h.sleep(100);
				await h.waitForRefDisplay(p, componentSelector, 'tombstones', '');
			}

			const
				chunkSize = await secondComponent.evaluate((ctx) => ctx.chunkSize);

			await h.waitForRefDisplay(p, componentSelector, 'tombstones', 'none');
			expect(await secondComponent.evaluate((ctx) => ctx.$refs.container.childElementCount)).toBe(chunkSize);
		});

		it('renders correct data chunk to the page', async () => {

			const
				chunkSize = await secondComponent.evaluate((ctx) => ctx.chunkSize);

			expect(await secondComponent.evaluate((ctx) => ctx.$refs.container.childElementCount)).toBe(chunkSize);

			expect(
				await secondComponent.evaluate((ctx) => ctx.$refs.container.children[0].getAttribute('data-index')
			)).toBe(`${reloadCount * chunkSize}`);
		});
	});
};
