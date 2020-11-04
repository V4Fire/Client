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

	describe('b-checkbox form API', () => {
		const
			q = '[data-id="target"]';

		const init = async (attrs = {}) => {
			await page.evaluate((attrs) => {
				const scheme = [
					{
						attrs: {
							'data-id': 'target',
							name: 'checkbox',
							validators: ['required'],
							messageHelpers: true,
							...attrs
						}
					},

					{
						attrs: {
							'data-id': 'second',
							name: 'checkbox',
							value: 'bar'
						}
					}
				];

				globalThis.renderComponents('b-checkbox', scheme);
			}, attrs);

			await h.bom.waitForIdleCallback(page);
			return h.component.waitForComponent(page, q);
		};

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
			).toBeUndefined();
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
			).toEqual(['foo', 'bar']);

			await page.click('[data-id="second"]');

			expect(
				await target.evaluate((ctx) => ctx.groupFormValue)
			).toEqual(['foo']);
		});

		it('resetting a checkbox without the default value', async () => {
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

		it('clearing a checkbox without the default value', async () => {
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

		it('resetting a checkbox with the default value', async () => {
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
	});
};
