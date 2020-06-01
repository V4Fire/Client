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
		const testInitLoad = async () => {
			const chunkSize = await c.evaluate((ctx) => ctx.chunkSize);

			c.evaluate((ctx) => ctx.initLoad());
			await h.waitForRefDisplay(page, componentSelector, 'tombstones', '');
			await h.waitForRefDisplay(page, componentSelector, 'tombstones', 'none');

			expect(await c.evaluate((ctx) => ctx.$refs.tombstones.style.display)).toBe('none');
			expect(await c.evaluate((ctx) => ctx.$refs.container.style.display)).toBe('');
			expect(await c.evaluate((ctx) => ctx.$refs.container.childElementCount)).toBe(chunkSize);
		};

		const testInitLoadPromise = testInitLoad();

		it('reloads data with initLoad', async () => {
			await testInitLoadPromise;
		});

		it('reloads data with frequent initLoad calls', async () => {
			// ...
		});
	});
};
