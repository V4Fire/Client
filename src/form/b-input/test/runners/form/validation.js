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

/** @param {Page} page */
module.exports = (page) => {
	beforeEach(async () => {
		await page.evaluate(() => {
			globalThis.removeCreatedComponents();
		});
	});

	describe('b-input form API validation', () => {
		describe('`required`', () => {
			it('simple usage', async () => {
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

			it('`required` with parameters (an array form)', async () => {
				const target = await init({
					validators: [['required', {msg: 'REQUIRED!'}]]
				});

				expect(await target.evaluate((ctx) => ctx.validate()))
					.toEqual({validator: 'required', error: false, msg: 'REQUIRED!'});

				expect(await target.evaluate((ctx) => ctx.block.element('error-box').textContent.trim()))
					.toBe('REQUIRED!');
			});

			it('`required` with parameters (an object form)', async () => {
				const target = await init({
					validators: [{required: {msg: 'REQUIRED!', showMsg: false}}]
				});

				expect(await target.evaluate((ctx) => ctx.validate()))
					.toEqual({validator: 'required', error: false, msg: 'REQUIRED!'});

				expect(await target.evaluate((ctx) => ctx.block.element('error-box').textContent.trim()))
					.toBe('');
			});

			it('forcing validation by `actionChange`', async () => {
				const target = await init({
					validators: ['required']
				});

				await target.evaluate((ctx) => ctx.emit('actionChange'));

				expect(await target.evaluate((ctx) => ctx.block.element('error-box').textContent.trim()))
					.toBe('Required field');
			});
		});

		describe('`number`', () => {
			it('simple usage', async () => {
				const target = await init({
					validators: ['number']
				});

				expect(await target.evaluate((ctx) => ctx.validate()))
					.toBeTrue();

				await target.evaluate((ctx) => {
					ctx.value = '0';
				});

				expect(await target.evaluate((ctx) => ctx.validate()))
					.toBeTrue();

				await target.evaluate((ctx) => {
					ctx.value = 'fff';
				});

				expect(await target.evaluate((ctx) => ctx.validate())).toEqual({
					validator: 'number',

					error: {
						name: 'INVALID_VALUE',
						value: 'NaN'
					},

					msg: 'The value is not a number'
				});

				expect(await target.evaluate((ctx) => ctx.block.element('error-box').textContent.trim()))
					.toBe('The value is not a number');
			});
		});

		async function init(attrs = {}) {
			await page.evaluate((attrs) => {
				const scheme = [
					{
						attrs: {
							'data-id': 'target',
							formValueConverter: ((v) => v !== '' ? parseInt(v, 10) : undefined).option(),
							messageHelpers: true,
							...attrs
						}
					}
				];

				globalThis.renderComponents('b-input', scheme);
			}, attrs);

			return h.component.waitForComponent(page, '[data-id="target"]');
		}
	});
};
