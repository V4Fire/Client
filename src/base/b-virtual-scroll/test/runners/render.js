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

module.exports = async (page, {componentSelector, component}) => {
	describe('b-virtual-scroll', () => {
		it('renders data chunks to the page', async () => {
			await helpers.waitItemsCountGreaterThan(page, 0, componentSelector);
			expect(await component.evaluate((ctx) => ctx.$refs.container.childElementCount)).toBeGreaterThan(0);

			await helpers.scrollAndWaitItemsCountGreaterThan(page, 10, componentSelector);
			expect(await component.evaluate((ctx) => ctx.$refs.container.childElementCount)).toBe(20);

			await helpers.scrollAndWaitItemsCountGreaterThan(page, 20, componentSelector);
			expect(await component.evaluate((ctx) => ctx.$refs.container.childElementCount)).toBe(30);
		});
	});
};
