/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import test from 'tests/config/unit/test';

import type iInput from 'super/i-input/i-input';
import type bCheckbox from 'form/b-checkbox/b-checkbox';
import type { ValidationError } from 'form/b-form/b-form';
import { createFormAndEnvironment, checkCheckboxes } from 'form/b-form/test/helpers';

test.describe('b-form simple usage', () => {
	test.beforeEach(async ({demoPage}) => {
		await demoPage.goto();
	});

	test('getting form elements', async ({page}) => {
		const
			target = await createFormAndEnvironment(page);

		test.expect(
			await target.evaluate(async (ctx) => {
				const els = await ctx.elements;
				return els.map((el) => el.name);
			})

		).toEqual(['adult', 'user', 'user', undefined]);
	});

	test('getting form values', async ({page}) => {
		const
			target = await createFormAndEnvironment(page);

		test.expect(await target.evaluate((ctx) => ctx.getValues(false)))
			.toEqual({user: 3});

		test.expect(await target.evaluate((ctx) => ctx.getValues(true)))
			.toEqual({});
	});

	test('clearing form values', async ({page}) => {
		const
			target = await createFormAndEnvironment(page);

		test.expect(
			await target.evaluate(async (ctx) => {
				const res = <any[]>[];

				ctx.on('clear', () => res.push('clear'));
				res.push(await ctx.clear(), await ctx.getValues());

				return res;
			})

		).toEqual(['clear', true, {user: 0}]);
	});

	test('resetting form values', async ({page}) => {
		const
			target = await createFormAndEnvironment(page);

		test.expect(
			await target.evaluate(async (ctx) => {
				const res = <any[]>[];

				ctx.on('clear', () => res.push('reset'));
				res.push(await ctx.reset(), await ctx.getValues());

				return res;
			})

		).toEqual(['reset', true, {user: 5}]);
	});

	test('validation', async ({page}) => {
		const
			target = await createFormAndEnvironment(page);

		test.expect(
			await target.evaluate(async (ctx) => {
				const res = <ValidationError>(await ctx.validate());
				return [res.component.componentName, res.details];
			})

		).toEqual([
			'b-checkbox',

			{
				validator: 'required',
				error: false,
				msg: 'REQUIRED!'
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

	test('listening validation events', async ({page}) => {
		const
			target = await createFormAndEnvironment(page);

		test.expect(
			await target.evaluate(async (ctx) => {
				const
					res = <any[]>[];

				ctx.on('validationStart', () => {
					res.push('start');
				});

				ctx.on('onValidationSuccess', () => {
					res.push('success');
				});

				ctx.on('onValidationFail', (err) => {
					res.push(err.details);
				});

				ctx.on('onValidationEnd', (status, err) => {
					res.push([status, err.details]);
				});

				await ctx.validate();
				return res;
			})

		).toEqual([
			'start',

			{
				validator: 'required',
				error: false,
				msg: 'REQUIRED!'
			},

			[
				false,

				{
					validator: 'required',
					error: false,
					msg: 'REQUIRED!'
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
					res = <any[]>[];

				ctx.on('validationStart', () => {
					res.push('start');
				});

				ctx.on('onValidationSuccess', () => {
					res.push('success');
				});

				ctx.on('onValidationFail', (err) => {
					res.push(err.details);
				});

				ctx.on('onValidationEnd', (status) => {
					res.push(status);
				});

				await ctx.validate();
				return res;
			})
		).toEqual(['start', 'success', true]);
	});
});
