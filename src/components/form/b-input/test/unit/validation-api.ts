/* eslint-disable max-lines */

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

import type bInput from 'components/form/b-input/b-input';

import test from 'tests/config/unit/test';
import Component from 'tests/helpers/component';
import Utils from 'tests/helpers/utils';

test.describe('<b-input> validation API', () => {
	test.beforeEach(async ({page, demoPage}) => {
		await demoPage.goto();

		const BlockAPI = await Utils.import<typeof Block>(page, 'components/friends/block');
		await BlockAPI.evaluate((ctx) => ctx.default.addToPrototype(ctx));

		const DOMAPI = await Utils.import<typeof DOM>(page, 'components/friends/dom');
		await DOMAPI.evaluate((ctx) => ctx.default.addToPrototype(ctx));
	});

	test('when validating a component, special events should be fired', async ({page}) => {
		const target = await renderInput(page, {
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
		const target = await renderInput(page, {
			validators: ['required']
		});

		await target.evaluate((ctx) => ctx.emit('actionChange'));

		test.expect(await target.evaluate(({unsafe}) => unsafe.block!.element('error-box')!.textContent!.trim()))
			.toBe('Required field');
	});

	test.describe('the `required` rule should check if the component value is filled', () => {
		test('calling `validate` on successful validation should return `true`', async ({page}) => {
			const target = await renderInput(page, {
				value: '42',
				validators: ['required']
			});

			test.expect(await target.evaluate((ctx) => ctx.validate())).toBe(true);
		});

		test('calling `validate` on failed validation should return an object with information about the error', async ({page}) => {
			const target = await renderInput(page, {
				validators: ['required']
			});

			test.expect(await target.evaluate((ctx) => ctx.validate())).toEqual({
				validator: 'required',
				message: 'Required field',
				error: {name: 'required'}
			});
		});

		test('`calling `validate` on failed validation should insert error text into markup if `messageHelpers` option is given`', async ({page}) => {
			const target = await renderInput(page, {
				validators: ['required']
			});

			await target.evaluate((ctx) => ctx.validate());

			test.expect(await target.evaluate(({unsafe}) => unsafe.block!.element('error-box')!.textContent!.trim()))
				.toBe('Required field');
		});

		test('configuring the validator with a custom error message', async ({page}) => {
			const target = await renderInput(page, {
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
			const target = await renderInput(page, {
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

	test.describe('the `number` rule should check if the component has a value that can be parsed as a number', () => {
		const defParams = {
			separator: ['.', ','],
			styleSeparator: [' ', '_']
		};

		test('simple usage', async ({page}) => {
			const target = await renderInput(page, {
				validators: ['number']
			});

			test.expect(await target.evaluate((ctx) => ctx.validate())).toBe(true);

			await target.evaluate((ctx) => {
				ctx.value = '0';
			});

			test.expect(await target.evaluate((ctx) => ctx.validate())).toBe(true);

			await target.evaluate((ctx) => {
				ctx.value = 'fff';
			});

			test.expect(await target.evaluate((ctx) => ctx.validate())).toEqual({
				validator: 'number',

				error: {
					name: 'INVALID_VALUE',
					value: 'NaN',
					params: defParams
				},

				message: 'The value is not a number'
			});

			test.expect(await target.evaluate(({unsafe}) => unsafe.block!.element('error-box')!.textContent!.trim()))
				.toBe('The value is not a number');
		});

		test.describe('providing `type` as', () => {
			test('`uint`', async ({page}) => {
				const params = {
					...defParams,
					type: 'uint'
				};

				const target = await renderInput(page, {
					value: '1',
					validators: [['number', {type: params.type}]]
				});

				test.expect(await target.evaluate((ctx) => ctx.validate())).toBe(true);

				await target.evaluate((ctx) => {
					ctx.value = '0';
				});

				test.expect(await target.evaluate((ctx) => ctx.validate())).toBe(true);

				await target.evaluate((ctx) => {
					ctx.value = '-4';
				});

				test.expect(await target.evaluate((ctx) => ctx.validate())).toEqual({
					validator: 'number',
					error: {name: 'INVALID_VALUE', value: -4, params},
					message: 'The value does not match an unsigned integer type'
				});

				await target.evaluate((ctx) => {
					ctx.value = '1.354';
				});

				test.expect(await target.evaluate((ctx) => ctx.validate())).toEqual({
					validator: 'number',
					error: {name: 'INVALID_VALUE', value: 1.354, params},
					message: 'The value does not match an unsigned integer type'
				});
			});

			test('`int`', async ({page}) => {
				const params = {
					...defParams,
					type: 'int'
				};

				const target = await renderInput(page, {
					value: '1',
					validators: [['number', {type: params.type}]]
				});

				test.expect(await target.evaluate((ctx) => ctx.validate())).toBe(true);

				await target.evaluate((ctx) => {
					ctx.value = '0';
				});

				test.expect(await target.evaluate((ctx) => ctx.validate())).toBe(true);

				await target.evaluate((ctx) => {
					ctx.value = '-4';
				});

				test.expect(await target.evaluate((ctx) => ctx.validate())).toBe(true);

				await target.evaluate((ctx) => {
					ctx.value = '1.354';
				});

				test.expect(await target.evaluate((ctx) => ctx.validate())).toEqual({
					validator: 'number',
					error: {name: 'INVALID_VALUE', value: 1.354, params},
					message: 'The value does not match integer type'
				});
			});

			test('`ufloat`', async ({page}) => {
				const params = {
					...defParams,
					type: 'ufloat'
				};

				const target = await renderInput(page, {
					value: '1',
					validators: [['number', {type: params.type}]]
				});

				test.expect(await target.evaluate((ctx) => ctx.validate())).toBe(true);

				await target.evaluate((ctx) => {
					ctx.value = '0';
				});

				test.expect(await target.evaluate((ctx) => ctx.validate())).toBe(true);

				await target.evaluate((ctx) => {
					ctx.value = '-4';
				});

				test.expect(await target.evaluate((ctx) => ctx.validate())).toEqual({
					validator: 'number',
					error: {name: 'INVALID_VALUE', value: -4, params},
					message: 'The value does not match an unsigned float type'
				});

				await target.evaluate((ctx) => {
					ctx.value = '-4.343';
				});

				test.expect(await target.evaluate((ctx) => ctx.validate())).toEqual({
					validator: 'number',
					error: {name: 'INVALID_VALUE', value: -4.343, params},
					message: 'The value does not match an unsigned float type'
				});

				await target.evaluate((ctx) => {
					ctx.value = '1.354';
				});

				test.expect(await target.evaluate((ctx) => ctx.validate())).toBe(true);
			});

			test('`float`', async ({page}) => {
				const target = await renderInput(page, {
					value: '1',
					validators: [['number', {type: 'float'}]]
				});

				test.expect(await target.evaluate((ctx) => ctx.validate())).toBe(true);

				await target.evaluate((ctx) => {
					ctx.value = '0';
				});

				test.expect(await target.evaluate((ctx) => ctx.validate())).toBe(true);

				await target.evaluate((ctx) => {
					ctx.value = '-4';
				});

				test.expect(await target.evaluate((ctx) => ctx.validate())).toBe(true);

				await target.evaluate((ctx) => {
					ctx.value = '-4.343';
				});

				test.expect(await target.evaluate((ctx) => ctx.validate())).toBe(true);

				await target.evaluate((ctx) => {
					ctx.value = '1.354';
				});

				test.expect(await target.evaluate((ctx) => ctx.validate())).toBe(true);
			});
		});

		test('providing `min` and `max`', async ({page}) => {
			const params = {
				...defParams,
				min: -1,
				max: 3
			};

			const target = await renderInput(page, {
				value: 1,
				validators: [['number', {min: params.min, max: params.max}]]
			});

			test.expect(await target.evaluate((ctx) => ctx.validate())).toBe(true);

			await target.evaluate((ctx) => {
				ctx.value = '-1';
			});

			test.expect(await target.evaluate((ctx) => ctx.validate())).toBe(true);

			await target.evaluate((ctx) => {
				ctx.value = '3';
			});

			test.expect(await target.evaluate((ctx) => ctx.validate())).toBe(true);

			await target.evaluate((ctx) => {
				ctx.value = '-4';
			});

			test.expect(await target.evaluate((ctx) => ctx.validate())).toEqual({
				validator: 'number',
				error: {name: 'MIN', value: -4, params},
				message: 'The value must be at least -1'
			});

			await target.evaluate((ctx) => {
				ctx.value = '6';
			});

			test.expect(await target.evaluate((ctx) => ctx.validate())).toEqual({
				validator: 'number',
				error: {name: 'MAX', value: 6, params},
				message: 'The value must be no more than 3'
			});
		});

		test('providing `separator` and `styleSeparator`', async ({page}) => {
			const params = {
				separator: ['.', ',', ';'],
				styleSeparator: [' ', '_', '-']
			};

			const target = await renderInput(page, {
				value: '100_500,200',
				validators: [['number', params]],
				formValueConverter: undefined
			});

			test.expect(await target.evaluate((ctx) => ctx.validate())).toBe(true);

			await target.evaluate((ctx) => {
				ctx.value = '100 500;200-300';
			});

			test.expect(await target.evaluate((ctx) => ctx.validate())).toBe(true);

			await target.evaluate((ctx) => {
				ctx.value = '6/2';
			});

			test.expect(await target.evaluate((ctx) => ctx.validate())).toEqual({
				validator: 'number',
				error: {name: 'INVALID_VALUE', value: '6/2', params},
				message: 'The value is not a number'
			});
		});

		test('providing `precision`', async ({page}) => {
			const params = {
				...defParams,
				precision: 2
			};

			const target = await renderInput(page, {
				value: '100.23',
				validators: [['number', {precision: params.precision}]],
				formValueConverter: undefined
			});

			test.expect(await target.evaluate((ctx) => ctx.validate())).toBe(true);

			await target.evaluate((ctx) => {
				ctx.value = '1.2';
			});

			test.expect(await target.evaluate((ctx) => ctx.validate())).toBe(true);

			await target.evaluate((ctx) => {
				ctx.value = '1.234567';
			});

			test.expect(await target.evaluate((ctx) => ctx.validate())).toEqual({
				validator: 'number',
				error: {name: 'DECIMAL_LENGTH', value: 1.234567, params},
				message: 'The decimal part must be no more than 2 digits'
			});
		});

		test('providing `precision` and `strictPrecision`', async ({page}) => {
			const params = {
				...defParams,
				precision: 2,
				strictPrecision: true
			};

			const target = await renderInput(page, {
				value: '100.23',
				validators: [['number', {precision: params.precision, strictPrecision: params.strictPrecision}]],
				formValueConverter: undefined
			});

			test.expect(await target.evaluate((ctx) => ctx.validate())).toBe(true);

			await target.evaluate((ctx) => {
				ctx.value = '1.2';
			});

			test.expect(await target.evaluate((ctx) => ctx.validate())).toEqual({
				validator: 'number',
				error: {name: 'DECIMAL_LENGTH', value: 1.2, params},
				message: 'The decimal part must be 2 digits'
			});

			await target.evaluate((ctx) => {
				ctx.value = '1.234567';
			});

			test.expect(await target.evaluate((ctx) => ctx.validate())).toEqual({
				validator: 'number',
				error: {name: 'DECIMAL_LENGTH', value: 1.234567, params},
				message: 'The decimal part must be 2 digits'
			});

			await target.evaluate((ctx) => {
				ctx.value = '1';
			});

			test.expect(await target.evaluate((ctx) => ctx.validate())).toEqual({
				validator: 'number',
				error: {name: 'DECIMAL_LENGTH', value: 1, params},
				message: 'The decimal part must be 2 digits'
			});
		});

		/**
		 * @param page
		 * @param attrs
		 */
		async function renderInput(page: Page, attrs: Dictionary = {}): Promise<JSHandle<bInput>> {
			await page.evaluate((attrs) => {
				const scheme = [
					{
						attrs: {
							'data-id': 'target',
							messageHelpers: true,
							formValueConverter: ((v) => v !== '' ? parseFloat(v) : undefined).option(),
							...attrs
						}
					}
				];

				globalThis.renderComponents('b-input', scheme);
			}, attrs);

			return Component.waitForComponentByQuery(page, '[data-id="target"]');
		}
	});

	test.describe('the `date` rule should check if the component has a value that can be parsed as a date', () => {
		test('simple usage', async ({page}) => {
			const target = await renderInput(page, {
				validators: ['date']
			});

			test.expect(await target.evaluate((ctx) => ctx.validate())).toBe(true);

			await target.evaluate((ctx) => {
				ctx.value = '0';
			});

			test.expect(await target.evaluate((ctx) => ctx.validate())).toBe(true);

			await target.evaluate((ctx) => {
				ctx.value = 'today';
			});

			test.expect(await target.evaluate((ctx) => ctx.validate())).toBe(true);

			await target.evaluate((ctx) => {
				ctx.value = '18.10.1989';
			});

			test.expect(await target.evaluate((ctx) => ctx.validate())).toBe(true);

			await target.evaluate((ctx) => {
				ctx.value = '1989.10.18';
			});

			test.expect(await target.evaluate((ctx) => ctx.validate())).toBe(true);

			await target.evaluate((ctx) => {
				ctx.value = '1989.18.10';
			});

			test.expect(await target.evaluate((ctx) => ctx.validate())).toEqual({
				validator: 'date',
				error: {name: 'INVALID_VALUE', value: '1989.18.10', params: {}},
				message: "The value can't be parsed as a date"
			});
		});

		test('providing `min` and `max`', async ({page}) => {
			const params = {
				min: '18.10.1989',
				max: '25.10.1989'
			};

			const target = await renderInput(page, {
				value: '19.10.1989',
				validators: [['date', params]]
			});

			test.expect(await target.evaluate((ctx) => ctx.validate())).toBe(true);

			await target.evaluate((ctx) => {
				ctx.value = '18.10.1989';
			});

			test.expect(await target.evaluate((ctx) => ctx.validate())).toBe(true);

			await target.evaluate((ctx) => {
				ctx.value = '25.10.1989';
			});

			test.expect(await target.evaluate((ctx) => ctx.validate())).toBe(true);

			await target.evaluate((ctx) => {
				ctx.value = '25.03.1989';
			});

			test.expect(await target.evaluate((ctx) => ctx.validate())).toEqual({
				validator: 'date',
				error: {name: 'MIN', value: new Date(1989, 2, 25), params},
				message: 'Date value must be at least "18.10.1989"'
			});

			await target.evaluate((ctx) => {
				ctx.value = '25.11.1989';
			});

			test.expect(await target.evaluate((ctx) => ctx.validate())).toEqual({
				validator: 'date',
				error: {name: 'MAX', value: new Date(1989, 10, 25), params},
				message: 'Date value must be no more than "25.10.1989"'
			});
		});

		test('providing `past` as `true`', async ({page}) => {
			const params = {
				past: true
			};

			const target = await renderInput(page, {
				value: '19.10.1989',
				validators: [['date', params]]
			});

			test.expect(await target.evaluate((ctx) => ctx.validate())).toBe(true);

			const
				date = Date.now() + 1e3;

			await target.evaluate((ctx, date) => {
				ctx.value = String(date);
			}, date);

			test.expect(await target.evaluate((ctx) => ctx.validate())).toEqual({
				validator: 'date',
				error: {name: 'NOT_PAST', value: new Date(date), params},
				message: 'Date value must be in the past'
			});
		});

		test('providing `past` as `false`', async ({page}) => {
			const params = {
				past: false
			};

			const target = await renderInput(page, {
				value: '18.10.1989',
				validators: [['date', params]]
			});

			test.expect(await target.evaluate((ctx) => ctx.validate())).toEqual({
				validator: 'date',
				error: {name: 'IS_PAST', value: new Date(1989, 9, 18), params},
				message: "Date value can't be in the past"
			});

			const
				date = Date.now() + 1e3;

			await target.evaluate((ctx, date) => {
				ctx.value = String(date);
			}, date);

			test.expect(await target.evaluate((ctx) => ctx.validate())).toBe(true);
		});

		test('providing `future` as `true`', async ({page}) => {
			const params = {
				future: true
			};

			const
				date = Date.now() + 10e3;

			const target = await renderInput(page, {
				value: date,
				validators: [['date', params]]
			});

			test.expect(await target.evaluate((ctx) => ctx.validate())).toBe(true);

			await target.evaluate((ctx) => {
				ctx.value = '18.10.1989';
			}, date);

			test.expect(await target.evaluate((ctx) => ctx.validate())).toEqual({
				validator: 'date',
				error: {name: 'NOT_FUTURE', value: new Date(1989, 9, 18), params},
				message: 'Date value must be in the future'
			});
		});

		test('providing `future` as `false`', async ({page}) => {
			const params = {
				future: false
			};

			const
				date = Date.now() + 10e3;

			const target = await renderInput(page, {
				value: date,
				validators: [['date', params]]
			});

			test.expect(await target.evaluate((ctx) => ctx.validate())).toEqual({
				validator: 'date',
				error: {name: 'IS_FUTURE', value: new Date(date), params},
				message: "Date value can't be in the future"
			});

			await target.evaluate((ctx) => {
				ctx.value = '18.10.1989';
			}, date);

			test.expect(await target.evaluate((ctx) => ctx.validate())).toBe(true);
		});
	});

	test.describe('the `email` rule should check if the component has a value that can be parsed as an email', () => {
		test('simple usage', async ({page}) => {
			const target = await renderInput(page, {
				value: 'foo@gmail.com',
				validators: ['email']
			});

			test.expect(await target.evaluate((ctx) => ctx.validate())).toBe(true);

			await target.evaluate((ctx) => {
				ctx.value = 'dddd';
			});

			test.expect(await target.evaluate((ctx) => ctx.validate())).toEqual({
				validator: 'email',
				error: {name: 'email'},
				message: 'Invalid email format'
			});
		});
	});

	test.describe('the `password` rule should check if the component has a value that matches the password requirement', () => {
		const defParams = {
			pattern: /^\w*$/,
			min: 6,
			max: 18
		};

		test('simple usage', async ({page}) => {
			const params = {
				...defParams,
				confirmComponent: '#confirm',
				oldPassComponent: '#old-pass'
			};

			const target = await renderInput(page, {
				validators: [
					[
						'password',

						{
							confirmComponent: params.confirmComponent,
							oldPassComponent: params.oldPassComponent
						}
					]
				]
			});

			test.expect(
				await target.evaluate(({unsafe}) => {
					unsafe.value = 'gkbf1';

					unsafe.dom.getComponent<bInput>('#confirm')!.value = 'gkbf1';
					unsafe.dom.getComponent<bInput>('#old-pass')!.value = 'gfs';

					return unsafe.validate();
				})
			).toEqual({
				validator: 'password',

				error: {
					name: 'MIN',
					value: 'gkbf1',
					params
				},

				message: 'Password length must be at least 6 characters'
			});

			test.expect(
				await target.evaluate(({unsafe}) => {
					unsafe.value = 'jfybf1ghbf1';

					unsafe.dom.getComponent<bInput>('#confirm')!.value = 'gkbf1';
					unsafe.dom.getComponent<bInput>('#old-pass')!.value = 'gfs';

					return unsafe.validate();
				})
			).toEqual({
				validator: 'password',

				error: {
					name: 'NOT_CONFIRM',
					value: ['jfybf1ghbf1', 'gkbf1'],
					params
				},

				message: "The passwords don't match"
			});

			test.expect(
				await target.evaluate(({unsafe}) => {
					unsafe.value = 'jfybf1ghbf1';

					unsafe.dom.getComponent<bInput>('#confirm')!.value = 'jfybf1ghbf1';
					unsafe.dom.getComponent<bInput>('#old-pass')!.value = 'jfybf1ghbf1';

					return unsafe.validate();
				})
			).toEqual({
				validator: 'password',

				error: {
					name: 'OLD_IS_NEW',
					value: 'jfybf1ghbf1',
					params
				},

				message: 'The old and new passwords are the same'
			});

			test.expect(
				await target.evaluate(({unsafe}) => {
					unsafe.value = 'jfybf1ghbf1';

					unsafe.dom.getComponent<bInput>('#confirm')!.value = 'jfybf1ghbf1';
					unsafe.dom.getComponent<bInput>('#old-pass')!.value = 'fffgh';

					return unsafe.validate();
				})
			).toBe(true);
		});

		test('providing `min` and `max`', async ({page}) => {
			const params = {
				...defParams,
				min: 2,
				max: 4
			};

			const target = await renderInput(page, {
				value: 'fdj',
				validators: [['password', {min: params.min, max: params.max}]]
			});

			test.expect(await target.evaluate((ctx) => ctx.validate())).toBe(true);

			await target.evaluate((ctx) => {
				ctx.value = 'vd';
			});

			test.expect(await target.evaluate((ctx) => ctx.validate())).toBe(true);

			await target.evaluate((ctx) => {
				ctx.value = 'vdfd';
			});

			test.expect(await target.evaluate((ctx) => ctx.validate())).toBe(true);

			await target.evaluate((ctx) => {
				ctx.value = 'd';
			});

			test.expect(await target.evaluate((ctx) => ctx.validate())).toEqual({
				validator: 'password',

				error: {
					name: 'MIN',
					value: 'd',
					params
				},

				message: 'Password length must be at least 2 characters'
			});

			await target.evaluate((ctx) => {
				ctx.value = 'gkbfd1';
			});

			test.expect(await target.evaluate((ctx) => ctx.validate())).toEqual({
				validator: 'password',

				error: {
					name: 'MAX',
					value: 'gkbfd1',
					params
				},

				message: 'Password length must be no more than 4 characters'
			});
		});

		test('providing `min`, `max` and `skipLength`', async ({page}) => {
			const params = {
				...defParams,
				min: 2,
				max: 4,
				skipLength: true
			};

			const target = await renderInput(page, {
				validators: [['password', {min: params.min, max: params.max, skipLength: params.skipLength}]]
			});

			await target.evaluate((ctx) => {
				ctx.value = 'd';
			});

			test.expect(await target.evaluate((ctx) => ctx.validate())).toBe(true);

			await target.evaluate((ctx) => {
				ctx.value = 'gkbfd1';
			});

			test.expect(await target.evaluate((ctx) => ctx.validate())).toBe(true);
		});

		/**
		 * @param page
		 * @param attrs
		 */
		async function renderInput(page: Page, attrs: Dictionary = {}): Promise<JSHandle<bInput>> {
			await page.evaluate((attrs) => {
				const scheme = [
					{
						attrs: {
							'data-id': 'target',
							messageHelpers: true,
							...attrs
						}
					},

					{
						attrs: {
							id: 'confirm'
						}
					},

					{
						attrs: {
							id: 'old-pass'
						}
					}
				];

				globalThis.renderComponents('b-input', scheme);
			}, attrs);

			return Component.waitForComponentByQuery(page, '[data-id="target"]');
		}
	});

	/**
	 * @param page
	 * @param attrs
	 */
	async function renderInput(page: Page, attrs: Dictionary = {}): Promise<JSHandle<bInput>> {
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

			globalThis.renderComponents('b-input', scheme);
		}, attrs);

		return Component.waitForComponentByQuery(page, '[data-id="target"]');
	}
});
