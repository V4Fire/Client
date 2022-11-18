/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { Page, JSHandle } from 'playwright';

import type * as Block from 'components/friends/block';
import type bHiddenInput from 'components/form/b-hidden-input/b-hidden-input';

import test from 'tests/config/unit/test';
import Component from 'tests/helpers/component';
import Utils from 'tests/helpers/utils';

test.describe('<b-hidden-input> validation API', () => {
	test.beforeEach(async ({page, demoPage}) => {
		await demoPage.goto();

		const BlockAPI = await Utils.import<typeof Block>(page, 'components/friends/block');
		await BlockAPI.evaluate((ctx) => ctx.default.addToPrototype(ctx));
	});

	test('when validating a component, special events should be fired', async ({page}) => {
		const target = await renderHiddenInput(page, {
			validators: ['required']
		});

		const capturedEvents = await target.evaluate(async (ctx) => {
			const
				events: Array<string | [string, unknown?, unknown?]> = [];

			ctx.on('onValidationStart', () => {
				events.push('validationStart');
			});

			ctx.on('onValidationSuccess', () => {
				events.push('validationSuccess');
			});

			ctx.on('onValidationFail', (err) => {
				events.push(['validationFail', err]);
			});

			ctx.on('onValidationEnd', (success, err) => {
				events.push(['validationEnd', success, err]);
			});

			await ctx.validate();

			// eslint-disable-next-line require-atomic-updates
			ctx.value = '0';
			await ctx.validate();

			return events;
		});

		test.expect(capturedEvents).toEqual([
			'validationStart',

			[
				'validationFail',

				{
					validator: 'required',
					message: 'Required field',
					error: {name: 'required'}
				}
			],

			[
				'validationEnd',
				false,

				{
					validator: 'required',
					message: 'Required field',
					error: {name: 'required'}
				}
			],

			'validationStart',
			'validationSuccess',

			['validationEnd', true, undefined]
		]);
	});

	test('when the `actionChange` event is emitted, validation should be triggered', async ({page}) => {
		const target = await renderHiddenInput(page, {
			validators: ['required'],
			messageHelpers: true
		});

		await target.evaluate((ctx) => ctx.emit('actionChange'));

		test.expect(await target.evaluate(({unsafe}) => unsafe.block!.element('error-box')!.textContent!.trim()))
			.toBe('Required field');
	});

	test.describe('the `required` rule should check if the component value is filled', () => {
		test('calling `validate` on successful validation should return `true`', async ({page}) => {
			const target = await renderHiddenInput(page, {
				value: '42',
				validators: ['required']
			});

			test.expect(await target.evaluate((ctx) => ctx.validate())).toBe(true);
		});

		test('calling `validate` on failed validation should return an object with information about the error', async ({page}) => {
			const target = await renderHiddenInput(page, {
				validators: ['required']
			});

			test.expect(await target.evaluate((ctx) => ctx.validate())).toEqual({
				validator: 'required',
				message: 'Required field',
				error: {name: 'required'}
			});
		});

		test('`calling `validate` on failed validation should insert error text into markup if `messageHelpers` option is given`', async ({page}) => {
			const target = await renderHiddenInput(page, {
				validators: ['required'],
				messageHelpers: true
			});

			await target.evaluate((ctx) => ctx.validate());

			test.expect(await target.evaluate(({unsafe}) => unsafe.block!.element('error-box')!.textContent!.trim()))
				.toBe('Required field');
		});

		test('configuring the validator with a custom error message', async ({page}) => {
			const target = await renderHiddenInput(page, {
				validators: [['required', {message: 'REQUIRED!'}]],
				messageHelpers: true
			});

			test.expect(await target.evaluate((ctx) => ctx.validate())).toEqual({
				validator: 'required',
				message: 'REQUIRED!',
				error: {name: 'required'}
			});

			test.expect(await target.evaluate(({unsafe}) => unsafe.block!.element('error-box')!.textContent!.trim()))
				.toBe('REQUIRED!');
		});

		test('configuring the validator without an error message', async ({page}) => {
			const target = await renderHiddenInput(page, {
				validators: [{required: {message: 'REQUIRED!', showMessage: false}}],
				messageHelpers: true
			});

			test.expect(await target.evaluate((ctx) => ctx.validate())).toEqual({
				validator: 'required',
				message: 'REQUIRED!',
				error: {name: 'required'}
			});

			test.expect(await target.evaluate((ctx) => ctx.unsafe.block!.element('error-box')!.textContent!.trim())).toBe('');
		});
	});

	/**
	 * @param page
	 * @param attrs
	 */
	async function renderHiddenInput(page: Page, attrs: Dictionary = {}): Promise<JSHandle<bHiddenInput>> {
		await page.evaluate((attrs) => {
			const scheme = [
				{
					attrs: {
						'data-id': 'target',
						formValueConverter: (val) => parseInt.option()(val),
						...attrs
					}
				}
			];

			globalThis.renderComponents('b-hidden-input', scheme);
		}, attrs);

		return Component.waitForComponentByQuery(page, '[data-id="target"]');
	}
});
