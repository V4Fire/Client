/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { JSHandle, Page } from 'playwright';

import test from 'tests/config/unit/test';

import Component from 'tests/helpers/component';

import type bCheckbox from 'form/b-checkbox/b-checkbox';

test.describe('b-checkbox form API', () => {
	const
		q = '[data-id="target"]';

	test.beforeEach(async ({demoPage}) => {
		await demoPage.goto();
	});

	test('validation', async ({page}) => {
		const
			target = await init(page);

		test.expect(await target.evaluate((ctx) => ctx.validate()))
			.toEqual({validator: 'required', error: false, msg: 'Required field'});

		test.expect(await target.evaluate((ctx) => ctx.unsafe.block!.element('error-box')?.textContent!.trim()))
			.toBe('Required field');

		await target.evaluate((ctx) => ctx.check());

		test.expect(await target.evaluate((ctx) => ctx.validate()))
			.toBe(true);
	});

	test('getting a form value', async ({page}) => {
		const target = await init(page);

		test.expect(
			await target.evaluate((ctx) => ctx.formValue)
		).toBeUndefined();

		await page.click(q);

		test.expect(
			await target.evaluate((ctx) => ctx.formValue)
		).toBe(true);

		await page.click(q);

		test.expect(
			await target.evaluate((ctx) => ctx.formValue)
		).toBeUndefined();
	});

	test('getting a group form value', async ({page}) => {
		const target = await init(page, {value: 'foo'});

		test.expect(
			await target.evaluate((ctx) => ctx.groupFormValue)
		).toEqual([]);

		await page.click(q);

		test.expect(
			await target.evaluate((ctx) => ctx.groupFormValue)
		).toEqual(['foo']);

		await page.click('[data-id="second"]');

		test.expect(
			await target.evaluate((ctx) => ctx.groupFormValue)
		).toEqual(['foo', 'bar']);

		await page.click('[data-id="second"]');

		test.expect(
			await target.evaluate((ctx) => ctx.groupFormValue)
		).toEqual(['foo']);
	});

	test('resetting a checkbox without the default value', async ({page}) => {
		const
			target = await init(page, {checked: true});

		test.expect(
			await target.evaluate((ctx) => ctx.value)
		).toBe(true);

		await target.evaluate((ctx) => ctx.reset());

		test.expect(
			await target.evaluate((ctx) => ctx.value)
		).toBeUndefined();
	});

	test('clearing a checkbox without the default value', async ({page}) => {
		const
			target = await init(page, {checked: true});

		test.expect(
			await target.evaluate((ctx) => ctx.value)
		).toBe(true);

		await target.evaluate((ctx) => ctx.clear());

		test.expect(
			await target.evaluate((ctx) => ctx.value)
		).toBeUndefined();
	});

	test('resetting a checkbox with the default value', async ({page}) => {
		const
			target = await init(page, {default: true});

		test.expect(
			await target.evaluate((ctx) => ctx.value)
		).toBe(true);

		await target.evaluate((ctx) => ctx.reset());

		test.expect(
			await target.evaluate((ctx) => ctx.value)
		).toBe(true);
	});

	/**
	 * @param page
	 * @param attrs
	 */
	async function init(page: Page, attrs: Dictionary = {}): Promise<JSHandle<bCheckbox>> {
		await Component.createComponent(page, 'b-checkbox', [
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
		]);

		return Component.waitForComponentByQuery(page, q);
	}
});
