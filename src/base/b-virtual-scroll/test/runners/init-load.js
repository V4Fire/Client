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

		const reloadCount = 6;
		let i = reloadCount;

		const testFrequentInitLoad = async () => {
			while (i--) {
				c.evaluate((ctx) => ctx.initLoad());
				await h.sleep(100);
				await h.waitForRefDisplay(page, componentSelector, 'tombstones', '');
			}
		};

		const testFrequentInitLoadPromise = async () => {
			await testInitLoadPromise;
			await testFrequentInitLoad();

			const
				chunkSize = await c.evaluate((ctx) => ctx.chunkSize);

			await h.waitForRefDisplay(page, componentSelector, 'tombstones', 'none');
			expect(await c.evaluate((ctx) => ctx.$refs.container.childElementCount)).toBe(chunkSize);
		};

		it('reloads data with frequent initLoad calls', testFrequentInitLoadPromise);

		it('renders correct data chunk to the page', async () => {
			await Promise.all([testInitLoadPromise, testFrequentInitLoadPromise]);

			const
				chunkSize = await c.evaluate((ctx) => ctx.chunkSize);

			expect(await c.evaluate((ctx) => ctx.$refs.container.childElementCount)).toBe(chunkSize);

			expect(
				await c.evaluate((ctx) => ctx.$refs.container.children[0].getAttribute('data-index')
			)).toBe(`${(reloadCount + 1) * chunkSize}`);
		});
	});
};
