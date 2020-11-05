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
	h = include('tests/helpers');

/**
 * @param {Page} page
 */
module.exports = (page) => {
	beforeEach(async () => {
		await page.evaluate(() => {
			globalThis.removeCreatedComponents();
		});
	});

	describe('b-input-hidden form API', () => {
		const
			q = '[data-id="target"]';

		const init = async (attrs = {}) => {
			await page.evaluate((attrs) => {
				const scheme = [
					{
						attrs: {
							'data-id': 'target',
							name: 'input',

							formValueConverter: [
								parseInt.option(),
								((v) => Promise.resolve(v * 2)).option(),
								((v) => v * 2).option()
							],

							...attrs
						}
					},

					{
						attrs: {
							'data-id': 'second',
							name: 'input',
							value: 'bar'
						}
					}
				];

				globalThis.renderComponents('b-input-hidden', scheme);
			}, attrs);

			await h.bom.waitForIdleCallback(page);
			return h.component.waitForComponent(page, q);
		};

		it('providing a value', async () => {
			const target = await init({
				value: '10'
			});

			expect(await target.evaluate((ctx) => ctx.value)).toBe('10');
		});

		it('providing the default value', async () => {
			const target = await init({
				default: '10'
			});

			expect(await target.evaluate((ctx) => ctx.value)).toBe('10');
		});

		it('providing the default value and value', async () => {
			const target = await init({
				value: '5',
				default: '10'
			});

			expect(await target.evaluate((ctx) => ctx.value)).toBe('5');
		});

		it('getting a form value', async () => {
			const target = await init();

			expect(
				await target.evaluate((ctx) => ctx.formValue)
			).toBeUndefined();

			await target.evaluate((ctx) => {
				ctx.value = '10';
			});

			expect(
				await target.evaluate((ctx) => ctx.formValue)
			).toBe(40);
		});

		it('getting a group form value', async () => {
			const target = await init({
				value: '10'
			});

			await target.evaluate((ctx) => {
				ctx.value = undefined;
			});

			expect(
				await target.evaluate((ctx) => ctx.groupFormValue)
			).toEqual(['bar']);
		});

		it('resetting a component without the default value', async () => {
			const target = await init({
				value: '10'
			});

			expect(
				await target.evaluate((ctx) => ctx.value)
			).toBe('10');

			expect(
				await target.evaluate(async (ctx) => {
					const
						res = [];

					ctx.on('onReset', (v) => {
						res.push(v);
					});

					res.push(await ctx.reset());
					res.push(await ctx.reset());

					return res;
				})
			).toEqual([undefined, true, false]);

			await target.evaluate((ctx) => ctx.reset());

			expect(
				await target.evaluate((ctx) => ctx.value)
			).toBeUndefined();
		});

		it('clearing a component without the default value', async () => {
			const target = await init({
				value: '10'
			});

			expect(
				await target.evaluate((ctx) => ctx.value)
			).toBe('10');

			expect(
				await target.evaluate(async (ctx) => {
					const
						res = [];

					ctx.on('onClear', (v) => {
						res.push(v);
					});

					res.push(await ctx.clear());
					res.push(await ctx.clear());

					return res;
				})
			).toEqual([undefined, true, false]);

			expect(
				await target.evaluate((ctx) => ctx.value)
			).toBeUndefined();
		});

		it('resetting a component with the default value', async () => {
			const target = await init({
				default: '10'
			});

			expect(
				await target.evaluate((ctx) => ctx.value)
			).toBe('10');

			await target.evaluate((ctx) => {
				ctx.value = '20';
			});

			expect(
				await target.evaluate((ctx) => ctx.value)
			).toBe('20');

			expect(
				await target.evaluate(async (ctx) => {
					const
						res = [];

					ctx.on('onReset', (v) => {
						res.push(v);
					});

					res.push(await ctx.reset());
					res.push(await ctx.reset());

					return res;
				})
			).toEqual(['10', true, false]);

			expect(
				await target.evaluate((ctx) => ctx.value)
			).toBe('10');
		});

		it('listening the `change` event', async () => {
			const target = await init();

			expect(
				await target.evaluate(async (ctx) => {
					const
						res = [];

					ctx.on('onChange', (v) => {
						res.push(v);
					});

					ctx.value = '1';
					ctx.value = '2';

					await ctx.nextTick();

					// eslint-disable-next-line require-atomic-updates
					ctx.value = '3';

					return res;
				})

			).toEqual(['2', '3']);
		});
	});
};
