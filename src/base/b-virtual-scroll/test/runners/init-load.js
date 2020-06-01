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

module.exports = async (p, {componentSelector, component: c}) => {
	describe('b-virtual-scroll', () => {
		const testInitLoad = async () => {
			const chunkSize = await c.evaluate((ctx) => ctx.chunkSize);

			c.evaluate((ctx) => ctx.initLoad());
			await h.waitForRefDisplay(p, componentSelector, 'tombstones', '');
			await h.waitForRefDisplay(p, componentSelector, 'tombstones', 'none');

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
			await testInitLoadPromise;

			while (i--) {
				c.evaluate((ctx) => ctx.initLoad());
				await h.sleep(100);
				await h.waitForRefDisplay(p, componentSelector, 'tombstones', '');
			}

			const
				chunkSize = await c.evaluate((ctx) => ctx.chunkSize);

			await h.waitForRefDisplay(p, componentSelector, 'tombstones', 'none');
			expect(await c.evaluate((ctx) => ctx.$refs.container.childElementCount)).toBe(chunkSize);
		};

		const testFrequentInitLoadPromise = testFrequentInitLoad();

		it('reloads data with frequent initLoad calls', async () => {
			await testFrequentInitLoadPromise;
		});

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
