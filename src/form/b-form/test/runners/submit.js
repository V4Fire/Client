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
	{createFormAndEnvironment} = include('src/form/b-form/test/helpers');

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
						res.push('start');
					});

					ctx.on('onValidationSuccess', () => {
						res.push('success');
					});

					ctx.on('onValidationFail', (err) => {
						res.push(err.error);
					});

					ctx.on('onValidationEnd', (status, err) => {
						res.push([status, err.error]);
					});

					await ctx.submit();
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
		});

		xit('failed submission with the action function', async () => {
			const target = await createFormAndEnvironment(page, {
				action: 'new Function("throw new Error(`boom!`)")'
			});

			await target.evaluate(async (ctx) => {
				Object.forEach(await ctx.elements, (el) => {
					if (el.componentName === 'b-checkbox') {
						el.toggle();
					}
				});
			});

			expect(
				await target.evaluate(async (ctx) => {
					const
						res = [];

					ctx.on('onSubmitStart', (ctx) => {
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
	});
};
