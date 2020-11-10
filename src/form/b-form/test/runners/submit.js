/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

// @ts-check

/**
 * @typedef {import('playwright').Page} Page
 */

const
	{createFormAndEnvironment, checkCheckboxes} = include('src/form/b-form/test/helpers');

/**
 * @param {Page} page
 */
module.exports = (page) => {
	beforeEach(async () => {
		await page.evaluate(() => {
			globalThis.removeCreatedComponents();
		});
	});

	describe('b-form submission of data', () => {
		it('with validation', async () => {
			const
				target = await createFormAndEnvironment(page);

			expect(
				await target.evaluate(async (ctx) => {
					const
						res = [];

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

		it('failed submission with the action function', async () => {
			const target = await createFormAndEnvironment(page, {
				action: 'new Function("throw new Error(`boom!`)")'
			});

			await checkCheckboxes(target);

			expect(
				await target.evaluate(async (ctx) => {
					const
						res = [];

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

		it('successful submission with the action function', async () => {
			const target = await createFormAndEnvironment(page, {
				action: 'new Function("body", "return Promise.resolve(body.user)")'
			});

			await checkCheckboxes(target);

			expect(
				await target.evaluate(async (ctx) => {
					const
						res = [];

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

		it('successful submission with a data provider', async () => {
			const target = await createFormAndEnvironment(page, {
				dataProvider: 'demo.Form'
			});

			await checkCheckboxes(target);

			expect(await target.evaluate((ctx) => ctx.submit())).toEqual({
				adult: true,
				user: 3
			});
		});

		it('successful submission with a data provider and the custom method', async () => {
			const target = await createFormAndEnvironment(page, {
				dataProvider: 'demo.Form',
				method: 'upd'
			});

			await checkCheckboxes(target);

			expect(await target.evaluate((ctx) => ctx.submit())).toEqual([
				'PUT',

				{
					adult: true,
					user: 3
				}
			]);
		});

		it('successful submission with a data provider and the custom URL', async () => {
			const target = await createFormAndEnvironment(page, {
				dataProvider: 'demo.Form',
				action: 'some/custom/url'
			});

			await checkCheckboxes(target);

			expect(await target.evaluate((ctx) => ctx.submit())).toEqual([
				'PUT',

				{
					adult: true,
					user: 3
				}
			]);
		});
	});
};
