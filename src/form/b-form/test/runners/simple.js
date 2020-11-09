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

	describe('b-form simple usage', () => {
		it('getting form elements', async () => {
			const
				target = await createFormAndEnvironment(page);

			expect(
				await target.evaluate(async (ctx) => {
					const els = await ctx.elements;
					return els.map((el) => el.name);
				})

			).toEqual(['adult', 'user', 'user', undefined]);
		});

		it('getting form values', async () => {
			const
				target = await createFormAndEnvironment(page);

			expect(await target.evaluate((ctx) => ctx.getValues(false)))
				.toEqual({user: 3});

			expect(await target.evaluate((ctx) => ctx.getValues(true)))
				.toEqual({});
		});

		it('clearing form values', async () => {
			const
				target = await createFormAndEnvironment(page);

			expect(
				await target.evaluate(async (ctx) => {
					const res = [];

					ctx.on('clear', () => res.push('clear'));
					res.push(await ctx.clear(), await ctx.getValues());

					return res;
				})

			).toEqual(['clear', true, {user: 0}]);
		});

		it('resetting form values', async () => {
			const
				target = await createFormAndEnvironment(page);

			expect(
				await target.evaluate(async (ctx) => {
					const res = [];

					ctx.on('clear', () => res.push('reset'));
					res.push(await ctx.reset(), await ctx.getValues());

					return res;
				})

			).toEqual(['reset', true, {user: 5}]);
		});

		it('validation', async () => {
			const
				target = await createFormAndEnvironment(page);

			expect(
				await target.evaluate(async (ctx) => {
					const res = await ctx.validate();
					return [res.component.componentName, res.error];
				})

			).toEqual([
				'b-checkbox',

				{
					validator: 'required',
					error: false,
					msg: 'REQUIRED!'
				}
			]);

			await target.evaluate(async (ctx) => {
				Object.forEach(await ctx.elements, (el) => {
					if (el.componentName === 'b-checkbox') {
						el.toggle();
					}
				});
			});

			expect(
				await target.evaluate(async (ctx) => {
					const res = await ctx.validate();
					return res.map((el) => el.name);
				})

			).toEqual(['adult', 'user', 'user']);
		});

		it('listening validation events', async () => {
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
						el.toggle();
					}
				});
			});

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

					ctx.on('onValidationEnd', (status) => {
						res.push(status);
					});

					await ctx.validate();
					return res;
				})
			).toEqual(['start', 'success', true]);
		});
	});
};
