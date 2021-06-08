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
	{initInput} = include('src/dummies/b-dummy-text/test/helpers');

/** @param {Page} page */
module.exports = (page) => {
	beforeEach(async () => {
		await page.evaluate(() => {
			globalThis.removeCreatedComponents();
		});
	});

	describe('b-dummy-text component events', () => {
		it('listening `selectText`', async () => {
			const target = await initInput(page, {
				text: 'foo'
			});

			expect(
				await target.evaluate((ctx) => {
					const
						res = [];

					ctx.on('selectText', () => res.push(true));
					ctx.selectText();
					ctx.selectText();

					return res;
				})
			).toEqual([true]);
		});

		it('listening `clearText`', async () => {
			const target = await initInput(page, {
				text: 'foo'
			});

			expect(
				await target.evaluate((ctx) => {
					const
						res = [];

					ctx.on('clearText', () => res.push(true));
					ctx.clearText();
					ctx.clearText();

					return res;
				})
			).toEqual([true]);
		});
	});
};
