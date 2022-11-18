/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type iInput from 'components/super/i-input/i-input';
import type bCheckbox from 'components/form/b-checkbox/b-checkbox';

import type { ValidationError } from 'components/form/b-form/b-form';
import { renderFormAndEnvironment, checkCheckboxes } from 'components/form/b-form/test/helpers';

import test from 'tests/config/unit/test';

test.describe('<b-form>', () => {
	test.beforeEach(async ({demoPage}) => {
		await demoPage.goto();
	});

	test('the `elements` getter should return a list of all form related components', async ({page}) => {
		const
			target = await renderFormAndEnvironment(page);

		test.expect(
			await target.evaluate(async (ctx) => {
				const els = await ctx.elements;
				return els.map((el) => el.name);
			})

		).toEqual(['adult', 'user', 'user', undefined]);
	});

	test('getting a list of form values to submit', async ({page}) => {
		const
			target = await renderFormAndEnvironment(page);

		test.expect(await target.evaluate((ctx) => ctx.getValues(false)))
			.toEqual({user: 3});

		test.expect(await target.evaluate((ctx) => ctx.getValues(true)))
			.toEqual({});
	});

	test('calling the `clear` method should clear all form components', async ({page}) => {
		const
			target = await renderFormAndEnvironment(page);

		test.expect(
			await target.evaluate(async (ctx) => {
				const scan: unknown[] = [];

				ctx.on('clear', () => scan.push('clear'));
				scan.push(await ctx.clear(), await ctx.getValues());

				return scan;
			})

		).toEqual(['clear', true, {user: 0}]);
	});

	test('calling the `reset` method should reset all form components', async ({page}) => {
		const
			target = await renderFormAndEnvironment(page);

		test.expect(
			await target.evaluate(async (ctx) => {
				const scan: unknown[] = [];

				ctx.on('reset', () => scan.push('reset'));
				scan.push(await ctx.reset(), await ctx.getValues());

				return scan;
			})

		).toEqual(['reset', true, {user: 5}]);
	});

	test('calling the `validate` method should check all form components', async ({page}) => {
		const target = await renderFormAndEnvironment(page);

		test.expect(
			await target.evaluate(async (ctx) => {
				const res = <ValidationError>(await ctx.validate());
				return [res.component.componentName, res.details];
			})

		).toEqual([
			'b-checkbox',

			{
				validator: 'required',
				error: {name: 'required'},
				message: 'REQUIRED!'
			}
		]);

		await checkCheckboxes(target);

		test.expect(
			await target.evaluate(async (ctx) => {
				const res = <iInput[]>(await ctx.validate());
				return res.map((el) => el.name);
			})

		).toEqual(['adult', 'user', 'user']);
	});

	test('when validating a component, special events should be fired', async ({page}) => {
		const target = await renderFormAndEnvironment(page);

		test.expect(
			await target.evaluate(async (ctx) => {
				const
					events: Array<string | [string, unknown?, unknown?]> = [];

				ctx.on('validationStart', () => {
					events.push('start');
				});

				ctx.on('onValidationSuccess', () => {
					events.push('success');
				});

				ctx.on('onValidationFail', (err) => {
					events.push(err.details);
				});

				ctx.on('onValidationEnd', (success, err) => {
					events.push([success, err?.details]);
				});

				await ctx.validate();
				return events;
			})

		).toEqual([
			'start',

			{
				validator: 'required',
				error: {name: 'required'},
				message: 'REQUIRED!'
			},

			[
				false,

				{
					validator: 'required',
					error: {name: 'required'},
					message: 'REQUIRED!'
				}
			]
		]);

		await target.evaluate(async (ctx) => {
			Object.forEach(await ctx.elements, (el) => {
				if (el.componentName === 'b-checkbox') {
					void (<bCheckbox>el).toggle();
				}
			});
		});

		test.expect(
			await target.evaluate(async (ctx) => {
				const
					events: Array<string | [string, unknown?, unknown?]> = [];

				ctx.on('validationStart', () => {
					events.push('start');
				});

				ctx.on('onValidationSuccess', () => {
					events.push('success');
				});

				ctx.on('onValidationFail', (err) => {
					events.push(err.details);
				});

				ctx.on('onValidationEnd', (success) => {
					events.push(success);
				});

				await ctx.validate();
				return events;
			})
		).toEqual(['start', 'success', true]);
	});
});
