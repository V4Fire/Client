/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { renderFormAndEnvironment, checkCheckboxes, interceptFormRequest } from 'components/form/b-form/test/helpers';

import test from 'tests/config/unit/test';

test.describe('<b-form> submission of data', () => {
	test.beforeEach(async ({demoPage}) => {
		await interceptFormRequest(demoPage.page);
		await demoPage.goto();
	});

	test('with validation', async ({page}) => {
		const
			target = await renderFormAndEnvironment(page);

		test.expect(
			await target.evaluate(async (ctx) => {
				const
					res = <any[]>[];

				ctx.on('validationStart', () => {
					res.push('validationStart');
				});

				ctx.on('onValidationSuccess', () => {
					res.push('validationSuccess');
				});

				ctx.on('onValidationFail', (err) => {
					res.push(err.details);
				});

				ctx.on('onValidationEnd', (status, err) => {
					res.push([status, err.details]);
				});

				ctx.on('onSubmitStart', (body, ctx) => {
					res.push(['submitStart', ctx.form.id, ctx.elements.length]);
				});

				ctx.on('onSubmitSuccess', () => {
					res.push('submitSuccess');
				});

				ctx.on('onSubmitFail', (err, ctx) => {
					res.push([err.name, err.details, ctx.form.id, ctx.elements.length]);
				});

				ctx.on('onSubmitEnd', (status, ctx) => {
					res.push([status.status, status.response.details, ctx.form.id, ctx.elements.length]);
				});

				await ctx.submit();
				return res;
			})

		).toEqual([
			'validationStart',

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
			],

			['submitStart', 'my-form', 0],

			[
				'ValidationError',

				{
					validator: 'required',
					error: {name: 'required'},
					message: 'REQUIRED!'
				},

				'my-form',
				0
			],

			[
				'fail',

				{
					validator: 'required',
					error: {name: 'required'},
					message: 'REQUIRED!'
				},

				'my-form',
				0
			]
		]);
	});

	test('failed submission with an action function', async ({page}) => {
		const target = await renderFormAndEnvironment(page, {
			action: () => {
				throw new Error('boom!');
			}
		});

		await checkCheckboxes(target);

		test.expect(
			await target.evaluate(async (ctx) => {
				const
					res: Array<Array<string | number>> = [];

				ctx.on('onSubmitStart', (body, ctx) => {
					res.push(['start', ctx.form.id, ctx.elements.length]);
				});

				ctx.on('onSubmitSuccess', () => {
					res.push(['success']);
				});

				ctx.on('onSubmitFail', (err, ctx) => {
					res.push([err.message, ctx.form.id, ctx.elements.length]);
				});

				ctx.on('onSubmitEnd', (status, ctx) => {
					res.push([status.status, status.response.message, ctx.form.id, ctx.elements.length]);
				});

				await ctx.submit();
				return res;
			})

		).toEqual([
			['start', 'my-form', 3],
			['boom!', 'my-form', 3],
			['fail', 'boom!', 'my-form', 3]
		]);
	});

	test('successful submission with an action function', async ({page}) => {
		const target = await renderFormAndEnvironment(page, {
			action: (body) => Promise.resolve(body.user)
		});

		await checkCheckboxes(target);

		test.expect(
			await target.evaluate(async (ctx) => {
				const
					res: Array<Array<string | number>> = [];

				ctx.on('onSubmitStart', (body, ctx) => {
					res.push(['start', ctx.form.id, ctx.elements.length]);
				});

				ctx.on('onSubmitSuccess', (response, ctx) => {
					res.push(['success!', response, ctx.form.id, ctx.elements.length]);
				});

				ctx.on('onSubmitFail', (err, ctx) => {
					res.push([err.message, ctx.form.id, ctx.elements.length]);
				});

				ctx.on('onSubmitEnd', (status, ctx) => {
					res.push([status.status, status.response, ctx.form.id, ctx.elements.length]);
				});

				res.push([await ctx.submit()]);
				return res;
			})

		).toEqual([
			['start', 'my-form', 3],
			['success!', 3, 'my-form', 3],
			['success', 3, 'my-form', 3],
			[3]
		]);
	});

	test('successful submission with a data provider', async ({page}) => {
		const target = await renderFormAndEnvironment(page, {
			dataProvider: 'Provider'
		});

		await checkCheckboxes(target);

		test.expect(await target.evaluate((ctx) => ctx.submit())).toEqual([
			'/api',

			'POST',

			{
				adult: true,
				user: 3
			}
		]);
	});

	test('successful submission with a data provider and custom method', async ({page}) => {
		const target = await renderFormAndEnvironment(page, {
			dataProvider: 'Provider',
			action: 'some/custom/url',
			method: 'update'
		});

		await checkCheckboxes(target);

		test.expect(await target.evaluate((ctx) => ctx.submit())).toEqual([
			'/api/some/custom/url',

			'PUT',

			{
				adult: true,
				user: 3
			}
		]);
	});

	test('successful submission with a data provider and custom URL', async ({page}) => {
		const target = await renderFormAndEnvironment(page, {
			action: 'some/custom/url'
		});

		await checkCheckboxes(target);
		await target.evaluate((ctx) => ctx.submit());

		test.expect(await target.evaluate((ctx) => ctx.submit())).toEqual([
			'/api/some/custom/url',

			'POST',

			{
				adult: true,
				user: 3
			}
		]);
	});
});
