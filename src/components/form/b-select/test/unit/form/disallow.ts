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
import { setValue, assertValueIs, assertFormValueIs } from 'components/form/b-select/test/helpers';

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

			await assertValueIs(target, '10');
			await assertFormValueIs(target, undefined);

			await setValue(target, '11');

			await assertValueIs(target, '11');
			await assertFormValueIs(target, 11);
		});

		test('as the multiple values', async ({page}) => {
			const target = await renderSelect(page, {
				value: '10',
				disallow: ['10', '11']
			});

			await assertValueIs(target, '10');
			await assertFormValueIs(target, undefined);

			await setValue(target, '11');

			await assertValueIs(target, '11');
			await assertFormValueIs(target, undefined);

			await setValue(target, '12');

			await assertValueIs(target, '12');
			await assertFormValueIs(target, 12);
		});

		test('as a RegExp', async ({page}) => {
			const target = await renderSelect(page, {
				value: '10',
				disallow: /^1/
			});

			await assertValueIs(target, '10');
			await assertFormValueIs(target, undefined);

			await setValue(target, '11');

			await assertValueIs(target, '11');
			await assertFormValueIs(target, undefined);

			await setValue(target, '5');

			await assertValueIs(target, '5');
			await assertFormValueIs(target, 5);
		});

		test('as a function', async ({page}) => {
			const target = await renderSelect(page, {
				value: '10',
				disallow: (v) => v === '10'
			});

			await assertValueIs(target, '10');
			await assertFormValueIs(target, undefined);

			await setValue(target, '11');

			await assertValueIs(target, '11');
			await assertFormValueIs(target, 11);
		});
	});

	/**
	 * Returns the rendered `b-select` component with the `formValueConverter`
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
