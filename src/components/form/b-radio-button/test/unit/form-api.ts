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

import type bRadioButton from 'components/form/b-radio-button/b-radio-button';

import test from 'tests/config/unit/test';
import Component from 'tests/helpers/component';
import Utils from 'tests/helpers/utils';

test.describe('<b-radio-button> form API', () => {
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
		const target = await renderRadioButton(page, {
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
		const target = await renderRadioButton(page);

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
		).toBe(true);

		await page.click(second);

		test.expect(
			await target.evaluate((ctx) => ctx.formValue)
		).toBeUndefined();
	});

	test('getting component group value from `groupFormValue`', async ({page}) => {
		const target = await renderRadioButton(page, {
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
		).toEqual(['bar']);

		await page.click(first);

		test.expect(
			await target.evaluate((ctx) => ctx.groupFormValue)
		).toEqual(['foo']);
	});

	test('resetting the radio button with no default value', async ({page}) => {
		const target = await renderRadioButton(page, {checked: true});

		test.expect(
			await target.evaluate((ctx) => ctx.value)
		).toBe(true);

		await target.evaluate((ctx) => ctx.reset());

		test.expect(
			await target.evaluate((ctx) => ctx.value)
		).toBeUndefined();
	});

	test('resetting the radio button with the default value', async ({page}) => {
		const target = await renderRadioButton(page, {default: true});

		test.expect(
			await target.evaluate((ctx) => ctx.value)
		).toBe(true);

		await target.evaluate((ctx) => ctx.reset());

		test.expect(
			await target.evaluate((ctx) => ctx.value)
		).toBe(true);
	});

	test('clearing the radio button with no default value', async ({page}) => {
		const target = await renderRadioButton(page, {checked: true});

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
	 * @param attrs
	 */
	async function renderRadioButton(page: Page, attrs: Dictionary = {}): Promise<JSHandle<bRadioButton>> {
		await Component.createComponent(page, 'b-radio-button', [
			{
				attrs: {
					'data-id': 'target',
					...attrs,
					name: 'radio',
					value: Object.isArray(attrs.value) ? attrs.value[0] : attrs.value
				}
			},

			{
				attrs: {
					'data-id': 'second',
					name: 'radio',
					value: Object.isArray(attrs.value) ? attrs.value[1] : undefined
				}
			}
		]);

		return Component.waitForComponentByQuery(page, first);
	}
});
