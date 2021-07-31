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
	h = include('tests/helpers');

/** @param {Page} page */
module.exports = (page) => {
	beforeEach(async () => {
		await page.evaluate(() => {
			globalThis.removeCreatedComponents();
		});
	});

	describe('b-radio-button form API', () => {
		const
			q = '[data-id="target"]';

		it('validation', async () => {
			const
				target = await init();

			expect(await target.evaluate((ctx) => ctx.validate()))
				.toEqual({validator: 'required', error: false, msg: 'Required field'});

			expect(await target.evaluate((ctx) => ctx.block.element('error-box').textContent.trim()))
				.toBe('Required field');

			await target.evaluate((ctx) => ctx.check());

			expect(await target.evaluate((ctx) => ctx.validate()))
				.toBeTrue();
		});

		it('getting a form value', async () => {
			const target = await init();

			expect(
				await target.evaluate((ctx) => ctx.formValue)
			).toBeUndefined();

			await page.click(q);

			expect(
				await target.evaluate((ctx) => ctx.formValue)
			).toBeTrue();

			await page.click(q);

			expect(
				await target.evaluate((ctx) => ctx.formValue)
			).toBeTrue();
		});

		it('getting a group form value', async () => {
			const target = await init({value: 'foo'});

			expect(
				await target.evaluate((ctx) => ctx.groupFormValue)
			).toEqual([]);

			await page.click(q);

			expect(
				await target.evaluate((ctx) => ctx.groupFormValue)
			).toEqual(['foo']);

			await page.click('[data-id="second"]');

			expect(
				await target.evaluate((ctx) => ctx.groupFormValue)
			).toEqual(['bar']);

			await page.click('[data-id="second"]');

			expect(
				await target.evaluate((ctx) => ctx.groupFormValue)
			).toEqual(['bar']);
		});

		it('resetting a radio button without the default value', async () => {
			const
				target = await init({checked: true});

			expect(
				await target.evaluate((ctx) => ctx.value)
			).toBeTrue();

			await target.evaluate((ctx) => ctx.reset());

			expect(
				await target.evaluate((ctx) => ctx.value)
			).toBeUndefined();
		});

		it('clearing a radio button without the default value', async () => {
			const
				target = await init({checked: true});

			expect(
				await target.evaluate((ctx) => ctx.value)
			).toBeTrue();

			await target.evaluate((ctx) => ctx.clear());

			expect(
				await target.evaluate((ctx) => ctx.value)
			).toBeUndefined();
		});

		it('resetting a radio button with the default value', async () => {
			const
				target = await init({default: true});

			expect(
				await target.evaluate((ctx) => ctx.value)
			).toBeTrue();

			await target.evaluate((ctx) => ctx.reset());

			expect(
				await target.evaluate((ctx) => ctx.value)
			).toBeTrue();
		});

		async function init(attrs = {}) {
			await page.evaluate((attrs) => {
				const scheme = [
					{
						attrs: {
							'data-id': 'target',
							name: 'radio',
							validators: ['required'],
							messageHelpers: true,
							...attrs
						}
					},

					{
						attrs: {
							'data-id': 'second',
							name: 'radio',
							value: 'bar'
						}
					}
				];

				globalThis.renderComponents('b-radio-button', scheme);
			}, attrs);

			return h.component.waitForComponent(page, q);
		}
	});
};
