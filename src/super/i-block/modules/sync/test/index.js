/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

// @ts-check

/**
 * @typedef {import('playwright').Page} Page
 */

const
	h = include('tests/helpers');

/**
 * Starts a test
 *
 * @param {Page} page
 * @param {!Object} params
 * @returns {!Promise<void>}
 */
module.exports = async (page, params) => {
	await h.utils.setup(page, params.context);

	let
		target;

	beforeEach(async () => {
		await page.evaluate(() => {
			const scheme = [
				{
					attrs: {
						id: 'target'
					}
				}
			];

			globalThis.renderComponents('b-dummy-sync', scheme);
		});

		target = await h.component.waitForComponent(page, '#target');
	});

	afterEach(async () => {
		await page.evaluate(() => {
			globalThis.removeCreatedComponents();
		});
	});

	describe('`iBlock.sync`', () => {
		xit('checking the initial values', async () => {
			expect(
				await target.evaluate((ctx) => ({
					dict: ctx.dict,
					linkToNestedFieldWithInitializer: ctx.linkToNestedFieldWithInitializer,
					watchableObject: Object.fastClone(ctx.watchableObject)
				}))
			).toEqual({
				dict: {a: {b: 2, c: 3}},
				linkToNestedFieldWithInitializer: 3,
				watchableObject: {
					dict: {a: {b: 2, c: 3}},
					linkToNestedFieldWithInitializer: 6,
					linkToPath: 2,
					linkToPathWithInitializer: 6
				}
			});
		});

		it('changing some values', async () => {
			expect(
				await target.evaluate((ctx) => {
					ctx.dict.a.b++;
					ctx.dict.a.c++;

					return {
						dict: ctx.dict,
						linkToNestedFieldWithInitializer: ctx.linkToNestedFieldWithInitializer,
						watchableObject: Object.fastClone(ctx.watchableObject)
					};
				})
			).toEqual({
				dict: {a: {b: 3, c: 4}},
				linkToNestedFieldWithInitializer: 4,
				watchableObject: {
					dict: {a: {b: 3, c: 4}},
					linkToNestedFieldWithInitializer: 8,
					linkToPath: 3,
					linkToPathWithInitializer: 8
				}
			});
		});
	});
};
