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
		it('renders truncated data chunks to the page', async () => {
			const [chunkSize, total, requestChunkSize, convertedLength] = await Promise.all([
				h.getField(c, 'chunkSize'),
				h.getField(c, 'request.get.total'),
				h.getField(c, 'request.get.chunkSize'),
				c.evaluate((ctx) => ctx.dbConverter({data: ctx.global.Array(100)}).data.length)
			]);

			const
				hasSkeletons = await c.evaluate((ctx) => Boolean(ctx.vdom.getSlot('tombstone'))),
				totalGivenDataToRender = total / (requestChunkSize / convertedLength);

			await h.waitItemsCountGreaterThan(page, 0, componentSelector);

			expect(await c.evaluate((ctx) => ctx.$refs.container.childElementCount)).toBe(chunkSize);

			await h.scrollToPageBottom(page);

			if (hasSkeletons) {
				await h.waitForRefDisplay(page, componentSelector, 'tombstones', '');
				expect(await c.evaluate((ctx) => ctx.$refs.tombstones.style.display)).toBe('');
			}

			await h.waitItemsCountGreaterThan(page, chunkSize, componentSelector);

			expect(await c.evaluate((ctx) => ctx.$refs.container.childElementCount)).toBe(totalGivenDataToRender);
			expect(await c.evaluate((ctx) => ctx.chunkRequest.isDone)).toBe(true);
			expect(await c.evaluate((ctx) => ctx.chunkRequest.pendingData.length)).toBe(0);

			if (hasSkeletons) {
				await h.waitForRefDisplay(page, componentSelector, 'tombstones', 'none');
				expect(await c.evaluate((ctx) => ctx.$refs.tombstones.style.display)).toBe('none');
			}
		});
	});
};
