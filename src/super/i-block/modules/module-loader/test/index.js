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

	beforeEach(async () => {
		await page.evaluate(() => {
			globalThis.removeCreatedComponents();
		});
	});

	describe('`iBlock.moduleLoader`', () => {
		it('loading dynamic modules from a template', async () => {
			const target = await init('loading dynamic modules from a template');

			expect(
				await target.evaluate(async (ctx) => {
					const wrapper = ctx.block.element('result');
					await ctx.localEmitter.promisifyOnce('asyncRenderComplete');
					return wrapper.textContent.trim();
				})
			).toBe('Ok 1  Ok 2');
		});
	});

	async function init(stage) {
		await page.evaluate((stage) => {
			const scheme = [
				{
					attrs: {
						id: 'target',
						stage
					}
				}
			];

			globalThis.renderComponents('b-dummy-module-loader', scheme);
		}, stage);

		return h.component.waitForComponent(page, '#target');
	}
};
