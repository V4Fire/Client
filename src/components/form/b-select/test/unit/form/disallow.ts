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

test.describe('<b-select> form API `disallow`', () => {

	test.beforeEach(async ({demoPage}) => {
		await demoPage.goto();
	});

	test('simple', async ({page}) => {
		const target = await renderSelect(page, {
			value: '10',
			disallow: '10'
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

	test('multiple', async ({page}) => {
		const target = await renderSelect(page, {
			value: '10',
			disallow: ['10', '11']
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

	test('RegExp', async ({page}) => {
		const target = await renderSelect(page, {
			value: '10',
			disallow: /^1/
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

	test('Function', async ({page}) => {
		const target = await renderSelect(page, {
			value: '10',
			disallow: (v) => v === '10'
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

	async function renderSelect(page: Page, attrs: RenderComponentsVnodeParams['attrs'] = {}): Promise<JSHandle<bSelect>> {
		return Component.createComponent(page, 'b-select', {
			'data-id': 'target',
			formValueConverter: (value: string) => parseInt(value, 10),
			...attrs
		});
	}
});
