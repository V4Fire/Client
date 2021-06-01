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

	describe('b-input form API `disallow`', () => {
		it('simple', async () => {
			const target = await init({
				value: '10',
				disallow: '10'
			});

			expect(
				await target.evaluate((ctx) => ctx.value)
			).toBe('10');

			expect(
				await target.evaluate((ctx) => ctx.formValue)
			).toBeUndefined();

			await target.evaluate((ctx) => {
				ctx.value = '11';
			});

			expect(
				await target.evaluate((ctx) => ctx.value)
			).toBe('11');

			expect(
				await target.evaluate((ctx) => ctx.formValue)
			).toBe(11);
		});

		it('multiple', async () => {
			const target = await init({
				value: '10',
				disallow: ['10', '11']
			});

			expect(
				await target.evaluate((ctx) => ctx.value)
			).toBe('10');

			expect(
				await target.evaluate((ctx) => ctx.formValue)
			).toBeUndefined();

			await target.evaluate((ctx) => {
				ctx.value = '11';
			});

			expect(
				await target.evaluate((ctx) => ctx.value)
			).toBe('11');

			expect(
				await target.evaluate((ctx) => ctx.formValue)
			).toBeUndefined();

			await target.evaluate((ctx) => {
				ctx.value = '12';
			});

			expect(
				await target.evaluate((ctx) => ctx.value)
			).toBe('12');

			expect(
				await target.evaluate((ctx) => ctx.formValue)
			).toBe(12);
		});

		it('RegExp', async () => {
			const target = await init({
				value: '10',
				disallow: /^1/
			});

			expect(
				await target.evaluate((ctx) => ctx.value)
			).toBe('10');

			expect(
				await target.evaluate((ctx) => ctx.formValue)
			).toBeUndefined();

			await target.evaluate((ctx) => {
				ctx.value = '11';
			});

			expect(
				await target.evaluate((ctx) => ctx.value)
			).toBe('11');

			expect(
				await target.evaluate((ctx) => ctx.formValue)
			).toBeUndefined();

			await target.evaluate((ctx) => {
				ctx.value = '5';
			});

			expect(
				await target.evaluate((ctx) => ctx.value)
			).toBe('5');

			expect(
				await target.evaluate((ctx) => ctx.formValue)
			).toBe(5);
		});

		it('Function', async () => {
			const target = await init({
				value: '10',
				// eslint-disable-next-line
				disallow: `new Function('v', 'return v === "10"')`
			});

			expect(
				await target.evaluate((ctx) => ctx.value)
			).toBe('10');

			expect(
				await target.evaluate((ctx) => ctx.formValue)
			).toBeUndefined();

			await target.evaluate((ctx) => {
				ctx.value = '11';
			});

			expect(
				await target.evaluate((ctx) => ctx.value)
			).toBe('11');

			expect(
				await target.evaluate((ctx) => ctx.formValue)
			).toBe(11);
		});

		async function init(attrs = {}) {
			await page.evaluate((attrs) => {
				const scheme = [
					{
						attrs: {
							'data-id': 'target',
							formValueConverter: parseInt,
							...attrs,
							// eslint-disable-next-line no-eval
							disallow: /new /.test(attrs.disallow) ? eval(attrs.disallow) : attrs.disallow
						}
					}
				];

				globalThis.renderComponents('b-input', scheme);
			}, attrs);

			return h.component.waitForComponent(page, '[data-id="target"]');
		}
	});
};
