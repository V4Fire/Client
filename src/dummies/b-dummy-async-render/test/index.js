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

	beforeAll(async () => {
		await page.evaluate(() => {
			globalThis.renderComponents('b-dummy-async-render', [
				{
					attrs: {
						id: 'target'
					}
				}
			]);
		});

		target = await h.component.waitForComponent(page, '#target');
	});

	describe('`iBlock.asyncRender`', () => {
		it('simple array rendering', async () => {
			expect(
				await target.evaluate(async (ctx) => {
					const wrapper = ctx.block.element('simple-array-rendering');

					if (!/Element: 4/.test(wrapper.innerText)) {
						await ctx.localEmitter.promisifyOnce('asyncRenderComplete');
					}

					return wrapper.innerHTML;
				})
			).toBe('Element: 1; Hook: beforeMount; Element: 2; Hook: mounted; Element: 3; Hook: mounted; Element: 4; Hook: mounted; ');
		});

		it('array rendering with specifying a chunk size', async () => {
			expect(
				await target.evaluate(async (ctx) => {
					const wrapper = ctx.block.element('array-rendering-with-chunk-size');

					if (!/Element: 4/.test(wrapper.innerText)) {
						await ctx.localEmitter.promisifyOnce('asyncRenderComplete');
					}

					return wrapper.innerHTML;
				})
			).toBe('Element: 1; Hook: beforeMount; Element: 2; Hook: beforeMount; Element: 3; Hook: beforeMount; Element: 4; Hook: mounted; ');
		});

		it('range rendering emitted by a click', async () => {
			expect(
				await target.evaluate((ctx) => ctx.block.element('range-rendering-by-click').innerHTML)
			).toBe('');

			expect(
				await target.evaluate(async (ctx) => {
					const wrapper = ctx.block.element('range-rendering-by-click');
					ctx.block.element('range-rendering-by-click-btn').click();
					await ctx.localEmitter.promisifyOnce('asyncRenderComplete');
					return wrapper.innerHTML;
				})
			).toBe('Element: 0; Hook: mounted; ');
		});
	});
};
