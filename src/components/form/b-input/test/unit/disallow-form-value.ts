/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { Page, JSHandle } from 'playwright';
import type bInput from 'components/form/b-input/b-input';

import test from 'tests/config/unit/test';
import Component from 'tests/helpers/component';

test.describe('<b-input> message helpers', () => {
	test.beforeEach(async ({demoPage}) => {
		await demoPage.goto();
	});

	test('the passed value for the component should be disallowed', async ({page}) => {
		const target = await renderInput(page, {
			value: '10',
			disallow: '10',
			formValueConverter: (val) => parseInt(val, 10)
		});

		test.expect(
			await target.evaluate((ctx) => ctx.value)
		).toBe('10');

		test.expect(
			await target.evaluate((ctx) => ctx.formValue)
		).toBeUndefined();

		await target.evaluate((ctx) => {
			ctx.value = '11';
		});

		test.expect(
			await target.evaluate((ctx) => ctx.value)
		).toBe('11');

		test.expect(
			await target.evaluate((ctx) => ctx.formValue)
		).toBe(11);
	});

	test('the passed iterable of values for the component should be disallowed', async ({page}) => {
		const target = await renderInput(page, {
			value: '10',
			disallow: ['10', '11'],
			formValueConverter: (val) => parseInt(val, 10)
		});

		test.expect(
			await target.evaluate((ctx) => ctx.value)
		).toBe('10');

		test.expect(
			await target.evaluate((ctx) => ctx.formValue)
		).toBeUndefined();

		await target.evaluate((ctx) => {
			ctx.value = '11';
		});

		test.expect(
			await target.evaluate((ctx) => ctx.value)
		).toBe('11');

		test.expect(
			await target.evaluate((ctx) => ctx.formValue)
		).toBeUndefined();

		await target.evaluate((ctx) => {
			ctx.value = '12';
		});

		test.expect(
			await target.evaluate((ctx) => ctx.value)
		).toBe('12');

		test.expect(
			await target.evaluate((ctx) => ctx.formValue)
		).toBe(12);
	});

	test('values that match the passed RegExp for the component should be disallowed', async ({page}) => {
		const target = await renderInput(page, {
			value: '10',
			disallow: /^1/,
			formValueConverter: (val) => parseInt(val, 10)
		});

		test.expect(
			await target.evaluate((ctx) => ctx.value)
		).toBe('10');

		test.expect(
			await target.evaluate((ctx) => ctx.formValue)
		).toBeUndefined();

		await target.evaluate((ctx) => {
			ctx.value = '11';
		});

		test.expect(
			await target.evaluate((ctx) => ctx.value)
		).toBe('11');

		test.expect(
			await target.evaluate((ctx) => ctx.formValue)
		).toBeUndefined();

		await target.evaluate((ctx) => {
			ctx.value = '5';
		});

		test.expect(
			await target.evaluate((ctx) => ctx.value)
		).toBe('5');

		test.expect(
			await target.evaluate((ctx) => ctx.formValue)
		).toBe(5);
	});

	test('values that match the passed function for the component should be disallowed', async ({page}) => {
		const target = await renderInput(page, {
			value: '10',
			disallow: (val) => val === '10',
			formValueConverter: (val) => parseInt(val, 10)
		});

		test.expect(
			await target.evaluate((ctx) => ctx.value)
		).toBe('10');

		test.expect(
			await target.evaluate((ctx) => ctx.formValue)
		).toBeUndefined();

		await target.evaluate((ctx) => {
			ctx.value = '11';
		});

		test.expect(
			await target.evaluate((ctx) => ctx.value)
		).toBe('11');

		test.expect(
			await target.evaluate((ctx) => ctx.formValue)
		).toBe(11);
	});

	/**
	 * @param page
	 * @param attrs
	 */
	async function renderInput(page: Page, attrs: Dictionary = {}): Promise<JSHandle<bInput>> {
		return Component.createComponent(page, 'b-input', {
			attrs: {
				'data-id': 'target',
				...attrs
			}
		});
	}
});
