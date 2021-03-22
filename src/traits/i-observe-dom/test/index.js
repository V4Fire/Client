/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

// @ts-check

const
	delay = require('delay'),
	h = include('tests/helpers');

/**
 * Starts a test
 *
 * @param {Playwright.Page} page
 * @param {!Object} params
 * @returns {!Promise<void>}
 */
module.exports = async (page, params) => {
	await h.utils.setup(page, params.context);

	let
		ctx,
		ctxNode;

	describe('iObserveDOM', () => {
		beforeEach(async () => {
			await h.utils.reloadAndWaitForIdle(page);

			ctx = await h.component.waitForComponent(page, '#dummy-component');
			ctxNode = await page.$('#dummy-component');
		});

		it('fires `onDOMChange`', async () => {
			const pr = ctx.evaluate((ctx) => new Promise((res) => ctx.localEmitter.once('DOMChange', res)));

			await ctxNode.evaluate((ctxNode) => {
				const div = document.createElement('div');
				ctxNode.append(div);
			});

			await expectAsync(pr).toBeResolved();
		});

		it('unobserve', async () => {
			ctx.evaluate((ctx) => ctx.localEmitter.once('DOMChange', () => globalThis.tVal = true));

			await ctx.evaluate((ctx) => {
				ctx.modules.iObserveDOM.unobserve(ctx, ctx.$el);

				const div = document.createElement('div');
				ctx.$el.append(div);
			});

			await delay(500);
			expect(await page.evaluate(() => globalThis.tVal)).toBeUndefined();
		});
	});
};
