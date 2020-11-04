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
 * @param {Page} page
 */
module.exports = (page) => {
	beforeEach(async () => {
		await page.evaluate(() => {
			globalThis.removeCreatedComponents();
		});
	});

	describe('b-input-hidden form API validation', () => {
		const
			q = '[data-id="target"]';

		const init = async (attrs = {}) => {
			await page.evaluate((attrs) => {
				const scheme = [
					{
						attrs: {
							'data-id': 'target',
							formValueConverter: parseInt.option(),
							...attrs
						}
					}
				];

				globalThis.renderComponents('b-input-hidden', scheme);
			}, attrs);

			await h.bom.waitForIdleCallback(page);
			return h.component.waitForComponent(page, q);
		};

		it('required', async () => {
			const target = await init({
				validators: ['required'],
				messageHelpers: true
			});

			expect(await target.evaluate((ctx) => ctx.validate()))
				.toEqual({validator: 'required', error: false, msg: 'Required field'});

			expect(await target.evaluate((ctx) => ctx.block.element('error-box').textContent.trim()))
				.toBe('Required field');

			await target.evaluate((ctx) => {
				ctx.value = '0';
			});

			expect(await target.evaluate((ctx) => ctx.validate()))
				.toBeTrue();
		});
	});
};
