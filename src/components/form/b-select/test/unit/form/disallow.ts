/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { JSHandle, Page } from 'playwright';

import test from 'tests/config/unit/test';

import { Component } from 'tests/helpers';

import type bSelect from 'components/form/b-select/b-select';

test.describe('<b-select> form API', () => {
	test.beforeEach(async ({demoPage}) => {
		await demoPage.goto();
	});

	test.describe([
		'`formValue` should be undefined',
		'when the component\'s `value` matches the `disallow` provided'
	].join(' '), () => {
		test('as a single value', async ({page}) => {
			const target = await renderSelect(page, {
				value: '10',
				disallow: '10'
			});

			await test.expect(target.evaluate((ctx) => ctx.value)).resolves.toBe('10');

			await test.expect(target.evaluate((ctx) => ctx.formValue)).resolves.toBeUndefined();

			await target.evaluate((ctx) => {
				ctx.value = '11';
			});

			await test.expect(target.evaluate((ctx) => ctx.value)).resolves.toBe('11');

			await test.expect(target.evaluate((ctx) => ctx.formValue)).resolves.toBe(11);
		});

		test('as the multiple values', async ({page}) => {
			const target = await renderSelect(page, {
				value: '10',
				disallow: ['10', '11']
			});

			await test.expect(target.evaluate((ctx) => ctx.value)).resolves.toBe('10');

			await test.expect(target.evaluate((ctx) => ctx.formValue)).resolves.toBeUndefined();

			await target.evaluate((ctx) => {
				ctx.value = '11';
			});

			await test.expect(target.evaluate((ctx) => ctx.value)).resolves.toBe('11');

			await test.expect(target.evaluate((ctx) => ctx.formValue)).resolves.toBeUndefined();

			await target.evaluate((ctx) => {
				ctx.value = '12';
			});

			await test.expect(target.evaluate((ctx) => ctx.value)).resolves.toBe('12');

			await test.expect(target.evaluate((ctx) => ctx.formValue)).resolves.toBe(12);
		});

		test('as a RegExp', async ({page}) => {
			const target = await renderSelect(page, {
				value: '10',
				disallow: /^1/
			});

			await test.expect(target.evaluate((ctx) => ctx.value)).resolves.toBe('10');

			await test.expect(target.evaluate((ctx) => ctx.formValue)).resolves.toBeUndefined();

			await target.evaluate((ctx) => {
				ctx.value = '11';
			});

			await test.expect(target.evaluate((ctx) => ctx.value)).resolves.toBe('11');

			await test.expect(target.evaluate((ctx) => ctx.formValue)).resolves.toBeUndefined();

			await target.evaluate((ctx) => {
				ctx.value = '5';
			});

			await test.expect(target.evaluate((ctx) => ctx.value)).resolves.toBe('5');

			await test.expect(target.evaluate((ctx) => ctx.formValue)).resolves.toBe(5);
		});

		test('as a function', async ({page}) => {
			const target = await renderSelect(page, {
				value: '10',
				disallow: (v) => v === '10'
			});

			await test.expect(target.evaluate((ctx) => ctx.value)).resolves.toBe('10');

			await test.expect(target.evaluate((ctx) => ctx.formValue)).resolves.toBeUndefined();

			await target.evaluate((ctx) => {
				ctx.value = '11';
			});

			await test.expect(target.evaluate((ctx) => ctx.value)).resolves.toBe('11');

			await test.expect(target.evaluate((ctx) => ctx.formValue)).resolves.toBe(11);
		});
	});

	/**
 	 * Returns rendered `b-select` component with the `formValueConverter`
   *
	 * @param page
	 * @param attrs
	 */
	async function renderSelect(page: Page, attrs: RenderComponentsVnodeParams['attrs'] = {}): Promise<JSHandle<bSelect>> {
		return Component.createComponent(page, 'b-select', {
			'data-id': 'target',
			formValueConverter: (value: string) => parseInt(value, 10),
			...attrs
		});
	}
});
