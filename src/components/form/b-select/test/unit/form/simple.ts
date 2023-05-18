/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { JSHandle, Page } from 'playwright';

import test from 'tests/config/unit/test';

import { Component, Utils } from 'tests/helpers';

import type bSelect from 'components/form/b-select/b-select';
import { assertValueIs, assertFormValueIs, setValue } from 'components/form/b-select/test/helpers';

test.describe('<b-select> form API', () => {

	test.beforeEach(async ({demoPage}) => {
		await demoPage.goto();
	});

	test('component\'s `value` should be set via a `value` prop', async ({page}) => {
		const target = await renderSelect(page, {
			value: '10'
		});

		await assertValueIs(target, '10');
	});

	test('component\'s `value` should be set via a `default` prop', async ({page}) => {
		const target = await renderSelect(page, {
			default: '11'
		});

		await assertValueIs(target, '11');
	});

	test([
		'component\'s `value` should be equal to the `value` prop',
		'when the `default` and `value` props are provided simultaneously'
	].join(' '), async ({page}) => {
		const target = await renderSelect(page, {
			value: '10',
			default: '11'
		});

		await assertValueIs(target, '10');
	});

	test('`formValue` should be modified by the `formValueConverter`', async ({page}) => {
		const target = await renderSelect(page);

		await test.expect(target.evaluate((ctx) => ctx.formValue)).resolves.toBeUndefined();

		await setValue(target, '10');

		await assertFormValueIs(target, 40);
	});

	test([
		'`groupFormValue` should be a tuple:',
		'label of the item, which has the specified `value`, and the `formValue`'
	].join(' '), async ({page}) => {
		const target = await renderSelect(page, {
			value: '10'
		});

		test.expect(
			await target.evaluate((ctx) => ctx.groupFormValue)
		).toEqual(['bar', 40]);
	});

	test.describe('`reset`', () => {
		test('should reset the component\'s value to the `default`', async ({page}) => {
			const target = await renderSelect(page, {
				default: '10'
			});

			await assertValueIs(target, '10');

			await setValue(target, '20');

			await assertValueIs(target, '20');

			await test.expect(target.evaluate(async (ctx) => {
				const res: any[] = [];

				ctx.on('onReset', (v) => {
					res.push(v);
				});

				res.push(await ctx.reset());
				res.push(await ctx.reset());

				return res;
			})).resolves.toEqual(['10', true, false]);

			await assertValueIs(target, '10');
		});

		test('should reset the component\'s value to undefined when the `default` is not provided', async ({page}) => {
			const target = await renderSelect(page, {
				value: '10'
			});

			await assertValueIs(target, '10');

			await test.expect(target.evaluate(async (ctx) => {
					const res: any[] = [];

					ctx.on('onReset', (v) => {
						res.push([v, ctx.text]);
					});

					res.push(await ctx.reset());
					res.push(await ctx.reset());

					return res;
				})).resolves.toEqual([[undefined, ''], true, false]);

			await target.evaluate((ctx) => ctx.reset());

			await assertValueIs(target, undefined);
		});
	});

	test('should `clear` a component without the default value', async ({page}) => {
		const target = await renderSelect(page, {
			value: '10'
		});

		await assertValueIs(target, '10');

		await test.expect(target.evaluate(async (ctx) => {
			const res: any[] = [];

			ctx.on('onClear', (v) => {
				res.push([v, ctx.text]);
			});

			res.push(await ctx.clear());
			res.push(await ctx.clear());

			return res;
		})).resolves.toEqual([[undefined, ''], true, false]);

		await assertValueIs(target, undefined);
	});

	test('should collapse the `change` events which have occured in a single tick', async ({page}) => {
		const target = await renderSelect(page);

		test.expect(
			await target.evaluate(async (ctx) => {
				const res: any[] = [];

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

	/**
	 * Returns the rendered `b-select` component with the `formValueConverter` and default items
	 *
	 * @param page
	 * @param attrs
	 */
	async function renderSelect(page: Page, attrs: RenderComponentsVnodeParams['attrs'] = {}): Promise<JSHandle<bSelect>> {

		await Component.createComponent(page, 'b-select', [
			{
				attrs: {
					'data-id': 'target',
					name: 'input',

					items: [
						{label: 'Foo', value: '10'},
						{label: 'Bar', value: '11'}
					],

					formValueConverter: Utils.evalInBrowser(() => [
						((v) => parseInt(v, 10)).option(),
						((v) => Promise.resolve(v * 2)).option(),
						((v) => v * 2).option()
					]),

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
		]);

		return Component.waitForComponentByQuery(page, '[data-id="target"]');
	}
});
