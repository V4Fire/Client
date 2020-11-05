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
							messageHelpers: true,
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
				validators: ['required']
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

		it('forcing validation by `actionChange`', async () => {
			const target = await init({
				validators: ['required']
			});

			await target.evaluate((ctx) => ctx.emit('actionChange'));

			expect(await target.evaluate((ctx) => ctx.block.element('error-box').textContent.trim()))
				.toBe('Required field');
		});

		it('required with parameters (the array form)', async () => {
			const target = await init({
				validators: [['required', {msg: 'REQUIRED!'}]]
			});

			expect(await target.evaluate((ctx) => ctx.validate()))
				.toEqual({validator: 'required', error: false, msg: 'REQUIRED!'});

			expect(await target.evaluate((ctx) => ctx.block.element('error-box').textContent.trim()))
				.toBe('REQUIRED!');
		});

		it('required with parameters (the object form)', async () => {
			const target = await init({
				validators: [{required: {msg: 'REQUIRED!', showMsg: false}}]
			});

			expect(await target.evaluate((ctx) => ctx.validate()))
				.toEqual({validator: 'required', error: false, msg: 'REQUIRED!'});

			expect(await target.evaluate((ctx) => ctx.block.element('error-box').textContent.trim()))
				.toBe('');
		});
	});
};
