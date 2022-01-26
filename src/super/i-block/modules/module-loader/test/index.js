// @ts-check

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * @typedef {import('playwright').Page} Page
 */

const
	h = include('tests/helpers').default;

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
		root;

	beforeAll(async () => {
		root = await h.component.waitForComponent(page, '.p-v4-components-demo');
	});

	beforeEach(async () => {
		await page.evaluate(() => {
			globalThis.loadFromProp = undefined;
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
			).toBe('Dummy module #1     Dummy module #1     Dummy module #2');
		});

		it('loading dynamic modules passed from the prop', async () => {
			await root.evaluate(() => {
				globalThis.loadFromProp = true;
			});

			const target = await init('loading dynamic modules passed from the prop');

			expect(
				await target.evaluate(async (ctx) => {
					await ctx.waitStatus('ready');
					return ctx.block.element('result').textContent.trim();
				})
			).toBe('Dummy module #1     Dummy module #2');
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
