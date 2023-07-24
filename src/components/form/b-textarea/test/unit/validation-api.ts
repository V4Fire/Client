/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { Page, JSHandle } from 'playwright';

import type * as DOM from 'components/friends/dom';
import type * as Block from 'components/friends/block';

import type bTextarea from 'components/form/b-textarea/b-textarea';

import test from 'tests/config/unit/test';
import Component from 'tests/helpers/component';
import Utils from 'tests/helpers/utils';

test.describe('<b-textarea> validation API', () => {
	test.beforeEach(async ({page, demoPage}) => {
		await demoPage.goto();

		const BlockAPI = await Utils.import<typeof Block>(page, 'components/friends/block');
		await BlockAPI.evaluate((ctx) => ctx.default.addToPrototype(ctx));

		const DOMAPI = await Utils.import<typeof DOM>(page, 'components/friends/dom');
		await DOMAPI.evaluate((ctx) => ctx.default.addToPrototype(ctx));
	});

	test('when validating a component, special events should be fired', async ({page}) => {
		const target = await renderTextarea(page, {
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
		const target = await renderTextarea(page, {
			validators: ['required']
		});

		await target.evaluate((ctx) => ctx.emit('actionChange'));

		test.expect(await target.evaluate(({unsafe}) => unsafe.block!.element('error-box')!.textContent!.trim()))
			.toBe('Required field');
	});

	test.describe('the `required` rule should check if the component value is filled', () => {
		test('calling `validate` on successful validation should return `true`', async ({page}) => {
			const target = await renderTextarea(page, {
				value: '42',
				validators: ['required']
			});

			test.expect(await target.evaluate((ctx) => ctx.validate())).toBe(true);
		});

		test('calling `validate` on failed validation should return an object with information about the error', async ({page}) => {
			const target = await renderTextarea(page, {
				validators: ['required']
			});

			test.expect(await target.evaluate((ctx) => ctx.validate())).toEqual({
				validator: 'required',
				message: 'Required field',
				error: {name: 'required'}
			});
		});

		test('`calling `validate` on failed validation should insert error text into markup if `messageHelpers` option is given`', async ({page}) => {
			const target = await renderTextarea(page, {
				validators: ['required']
			});

			await target.evaluate((ctx) => ctx.validate());

			test.expect(await target.evaluate(({unsafe}) => unsafe.block!.element('error-box')!.textContent!.trim()))
				.toBe('Required field');
		});

		test('configuring the validator with a custom error message', async ({page}) => {
			const target = await renderTextarea(page, {
				validators: [['required', {message: 'REQUIRED!'}]]
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
			const target = await renderTextarea(page, {
				validators: [{required: {message: 'REQUIRED!', showMessage: false}}]
			});

			test.expect(await target.evaluate((ctx) => ctx.validate())).toEqual({
				validator: 'required',
				message: 'REQUIRED!',
				error: {name: 'required'}
			});

			test.expect(await target.evaluate((ctx) => ctx.unsafe.block!.element('error-box')!.textContent!.trim())).toBe('');
		});
	});

	test.describe('the `pattern` rule should check if the component value matches the specified pattern', () => {
		test('simple usage', async ({page}) => {
			const params = {
				pattern: '\\d'
			};

			const target = await renderTextarea(page, {
				value: '1456',
				validators: [['pattern', params]]
			});

			test.expect(await target.evaluate((ctx) => ctx.validate())).toBe(true);

			await target.evaluate((ctx) => {
				ctx.value = 'dddd';
			});

			test.expect(await target.evaluate((ctx) => ctx.validate())).toEqual({
				validator: 'pattern',
				error: {name: 'NOT_MATCH', value: 'dddd', params},
				message: 'The text must match the pattern'
			});
		});

		test('providing `min` and `max`', async ({page}) => {
			const params = {
				min: 2,
				max: 4
			};

			const target = await renderTextarea(page, {
				value: '123',
				validators: [['pattern', params]]
			});

			test.expect(await target.evaluate((ctx) => ctx.validate())).toBe(true);

			await target.evaluate((ctx) => {
				ctx.value = '12';
			});

			test.expect(await target.evaluate((ctx) => ctx.validate())).toBe(true);

			await target.evaluate((ctx) => {
				ctx.value = '3414';
			});

			test.expect(await target.evaluate((ctx) => ctx.validate())).toBe(true);

			await target.evaluate((ctx) => {
				ctx.value = '1';
			});

			test.expect(await target.evaluate((ctx) => ctx.validate())).toEqual({
				validator: 'pattern',
				error: {name: 'MIN', value: '1', params},
				message: 'The text length must be at least 2 characters'
			});

			await target.evaluate((ctx) => {
				ctx.value = '3456879';
			});

			test.expect(await target.evaluate((ctx) => ctx.validate())).toEqual({
				validator: 'pattern',
				error: {name: 'MAX', value: '3456879', params},
				message: 'The text length must be no more than 4 characters'
			});
		});

		test('providing `min`, `max` and `skipLength`', async ({page}) => {
			const target = await renderTextarea(page, {
				value: '12',
				validators: [['pattern', {min: 1, max: 3, skipLength: true}]]
			});

			test.expect(await target.evaluate((ctx) => ctx.validate())).toBe(true);

			await target.evaluate((ctx) => {
				ctx.value = '1';
			});

			test.expect(await target.evaluate((ctx) => ctx.validate()))
				.toBe(true);

			await target.evaluate((ctx) => {
				ctx.value = '341';
			});

			test.expect(await target.evaluate((ctx) => ctx.validate()))
				.toBe(true);

			await target.evaluate((ctx) => {
				ctx.value = '';
			});

			test.expect(await target.evaluate((ctx) => ctx.validate()))
				.toBe(true);

			await target.evaluate((ctx) => {
				ctx.value = '3456879';
			});

			test.expect(await target.evaluate((ctx) => ctx.validate())).toBe(true);
		});
	});

	async function renderTextarea(page: Page, attrs: RenderComponentsVnodeParams['attrs'] = {}): Promise<JSHandle<bTextarea>> {
		await page.evaluate((attrs) => {
			const scheme = [
				{
					attrs: {
						'data-id': 'target',
						messageHelpers: true,
						...attrs
					}
				}
			];

			globalThis.renderComponents('b-textarea', scheme);
		}, attrs);

		return Component.waitForComponentByQuery(page, '[data-id="target"]');
	}
});
