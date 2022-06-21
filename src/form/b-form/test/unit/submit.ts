import test from 'tests/config/unit/test';

import { createFormAndEnvironment, checkCheckboxes, interceptFormRequest } from 'form/b-form/test/helpers';

test.describe('b-form submission of data', () => {
	test.beforeEach(async ({demoPage}) => {
		await interceptFormRequest(demoPage.page);
		await demoPage.goto();
	});

	test('with validation', async ({page}) => {
		const
			target = await createFormAndEnvironment(page);

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
			],

			['submitStart', 'my-form', 0],

			[
				'ValidationError',

				{
					validator: 'required',
					error: false,
					msg: 'REQUIRED!'
				},

				'my-form',
				0
			],

			[
				'fail',

				{
					validator: 'required',
					error: false,
					msg: 'REQUIRED!'
				},

				'my-form',
				0
			]
		]);
	});

	test('failed submission with the action function', async ({page}) => {
		const target = await createFormAndEnvironment(page, {
			action: () => {
				throw new Error('boom!');
			}
		});

		await checkCheckboxes(target);

		test.expect(
			await target.evaluate(async (ctx) => {
				const
					res = <any[]>[];

				ctx.on('onSubmitStart', (body, ctx) => {
					res.push(['start', ctx.form.id, ctx.elements.length]);
				});

				ctx.on('onSubmitSuccess', () => {
					res.push('success');
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

	test('successful submission with the action function', async ({page}) => {
		const target = await createFormAndEnvironment(page, {
			action: (body) => Promise.resolve(body.user)
		});

		await checkCheckboxes(target);

		test.expect(
			await target.evaluate(async (ctx) => {
				const
					res = <any[]>[];

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

				res.push(await ctx.submit());
				return res;
			})

		).toEqual([
			['start', 'my-form', 3],
			['success!', 3, 'my-form', 3],
			['success', 3, 'my-form', 3],
			3
		]);
	});

	test('successful submission with a data provider', async ({page}) => {
		const target = await createFormAndEnvironment(page, {
			dataProvider: 'demo.Form'
		});

		await checkCheckboxes(target);

		test.expect(await target.evaluate((ctx) => ctx.submit())).toEqual([
			'/form',

			'POST',

			{
				adult: true,
				user: 3
			}
		]);
	});

	test('successful submission with a data provider and the custom method', async ({page}) => {
		const target = await createFormAndEnvironment(page, {
			dataProvider: 'demo.Form',
			method: 'upd'
		});

		await checkCheckboxes(target);

		test.expect(await target.evaluate((ctx) => ctx.submit())).toEqual([
			'PUT',

			{
				adult: true,
				user: 3
			}
		]);
	});

	test('successful submission with a data provider and the custom URL', async ({page}) => {
		const target = await createFormAndEnvironment(page, {
			dataProvider: 'demo.Form',
			action: 'some/custom/url'
		});

		await checkCheckboxes(target);

		await target.evaluate((ctx) => ctx.submit());

		test.expect(await target.evaluate((ctx) => ctx.submit())).toEqual([
			'/some/custom/url',

			'POST',

			{
				adult: true,
				user: 3
			}
		]);

	});
});
