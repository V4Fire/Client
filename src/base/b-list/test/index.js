/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

// @ts-check

const
	h = include('tests/helpers');

/**
 * Starts a test
 *
 * @param {?} page
 * @param {!Object} params
 * @returns {!Promise<void>}
 */
module.exports = async (page, params) => {
	await h.utils.setup(page, params.context);

	describe('b-list', () => {
		beforeEach(async () => {
			await page.evaluate(() => {
				globalThis.removeCreatedComponents();
			});
		});

		it('simple list with defined items', async () => {
			await page.evaluate(() => {
				globalThis.renderComponents('b-list', [
					{
						attrs: {
							id: 'target',

							items: [
								{
									label: 'Foo',
									value: 0
								},

								{
									label: 'Bla',
									value: 1
								}
							]
						}
					}
				]);
			});

			await h.bom.waitForIdleCallback(page);

			const
				target = await h.component.waitForComponent(page, '#target');

			expect(
				await target.evaluate((ctx) => {
					const items = Array.from(ctx.block.elements('item'));
					return items.map((el) => el.textContent.trim());
				})

			).toEqual(['Foo', 'Bla']);
		});
	});
};
