/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { JSHandle, Page } from 'playwright';

import type * as DOM from 'components/friends/dom';
import type * as Block from 'components/friends/block';

import type bCheckbox from 'components/form/b-checkbox/b-checkbox';

import test from 'tests/config/unit/test';
import Component from 'tests/helpers/component';
import Utils from 'tests/helpers/utils';

test.describe('<b-checkbox> form API', () => {
	const
		first = '[data-id="target"]',
		second = '[data-id="second"]';

	test.beforeEach(async ({page, demoPage}) => {
		await demoPage.goto();

		const
			DOMAPI = await Utils.import<typeof DOM>(page, 'components/friends/dom'),
			BlockAPI = await Utils.import<typeof Block>(page, 'components/friends/block');

		await DOMAPI.evaluate((ctx) => ctx.default.addToPrototype(ctx));
		await BlockAPI.evaluate((ctx) => ctx.default.addToPrototype(ctx));
	});

	test('component value validation', async ({page}) => {
		const target = await renderCheckbox(page, {
			validators: ['required'],
			messageHelpers: true
		});

		test.expect(await target.evaluate((ctx) => ctx.validate())).toEqual({
			validator: 'required',
			message: 'Required field',
			error: {name: 'required'}
		});

		test.expect(await target.evaluate((ctx) => ctx.unsafe.block!.element('error-box')?.textContent!.trim()))
			.toBe('Required field');

		await target.evaluate((ctx) => ctx.check());

		test.expect(await target.evaluate((ctx) => ctx.validate()))
			.toBe(true);
	});

	test('getting component value from `formValue`', async ({page}) => {
		const target = await renderCheckbox(page);

		test.expect(
			await target.evaluate((ctx) => ctx.formValue)
		).toBeUndefined();

		await page.click(first);

		test.expect(
			await target.evaluate((ctx) => ctx.formValue)
		).toBe(true);

		await page.click(first);

		test.expect(
			await target.evaluate((ctx) => ctx.formValue)
		).toBeUndefined();
	});

	test('getting component group value from `groupFormValue`', async ({page}) => {
		const target = await renderCheckbox(page, {
			name: 'test',
			value: ['foo', 'bar']
		});

		test.expect(
			await target.evaluate((ctx) => ctx.groupFormValue)
		).toEqual([]);

		await page.click(first);

		test.expect(
			await target.evaluate((ctx) => ctx.groupFormValue)
		).toEqual(['foo']);

		await page.click(second);

		test.expect(
			await target.evaluate((ctx) => ctx.groupFormValue)
		).toEqual(['foo', 'bar']);

		await page.click(second);

		test.expect(
			await target.evaluate((ctx) => ctx.groupFormValue)
		).toEqual(['foo']);
	});

	test('resetting the checkbox with no default value', async ({page}) => {
		const target = await renderCheckbox(page, {checked: true});

		test.expect(
			await target.evaluate((ctx) => ctx.value)
		).toBe(true);

		await target.evaluate((ctx) => ctx.reset());

		test.expect(
			await target.evaluate((ctx) => ctx.value)
		).toBeUndefined();
	});

	test('resetting the checkbox with the default value', async ({page}) => {
		const target = await renderCheckbox(page, {default: true});

		test.expect(
			await target.evaluate((ctx) => ctx.value)
		).toBe(true);

		await target.evaluate((ctx) => ctx.reset());

		test.expect(
			await target.evaluate((ctx) => ctx.value)
		).toBe(true);
	});

	test('clearing the checkbox with no default value', async ({page}) => {
		const target = await renderCheckbox(page, {checked: true});

		test.expect(
			await target.evaluate((ctx) => ctx.value)
		).toBe(true);

		await target.evaluate((ctx) => ctx.clear());

		test.expect(
			await target.evaluate((ctx) => ctx.value)
		).toBeUndefined();
	});

	/**
	 * @param page
	 * @param [attrs]
	 */
	async function renderCheckbox(page: Page, attrs: Dictionary = {}): Promise<JSHandle<bCheckbox>> {
		await Component.createComponent(page, 'b-checkbox', [
			{
				attrs: {
					'data-id': 'target',
					...attrs,
					value: Object.isArray(attrs.value) ? attrs.value[0] : attrs.value
				}
			},

			{
				attrs: {
					'data-id': 'second',
					name: attrs.name,
					value: Object.isArray(attrs.value) ? attrs.value[1] : undefined
				}
			}
		]);

		return Component.waitForComponentByQuery(page, first);
	}
});
