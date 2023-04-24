/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { JSHandle, Page } from 'playwright';

import test from 'tests/config/unit/test';

import type bSelect from 'components/form/b-select/b-select';

import { Component, Utils } from 'tests/helpers';

test.describe('<b-select> form API', () => {

	test.beforeEach(async ({demoPage}) => {
		await demoPage.goto();
	});

	test('providing a value', async ({page}) => {
		const target = await renderSelect(page, {
			value: '10'
		});

		test.expect(await target.evaluate((ctx) => ctx.value)).toBe('10');
	});

	test('providing the default value', async ({page}) => {
		const target = await renderSelect(page, {
			default: '11'
		});

		test.expect(await target.evaluate((ctx) => ctx.value)).toBe('11');
	});

	test('providing the default value and value', async ({page}) => {
		const target = await renderSelect(page, {
			value: '10',
			default: '11'
		});

		test.expect(await target.evaluate((ctx) => ctx.value)).toBe('10');
	});

	test('getting a form value', async ({page}) => {
		const target = await renderSelect(page);

		test.expect(
			await target.evaluate((ctx) => ctx.formValue)
		).toBeUndefined();

		await target.evaluate((ctx) => {
			ctx.value = '10';
		});

		test.expect(
			await target.evaluate((ctx) => ctx.formValue)
		).toBe(40);
	});

	test('getting a group form value', async ({page}) => {
		const target = await renderSelect(page, {
			value: '10'
		});

		test.expect(
			await target.evaluate((ctx) => ctx.groupFormValue)
		).toEqual(['bar', 40]);
	});

	test('resetting a component without the default value', async ({page}) => {
		const target = await renderSelect(page, {
			value: '10'
		});

		test.expect(
			await target.evaluate((ctx) => ctx.value)
		).toBe('10');

		test.expect(
			await target.evaluate(async (ctx) => {
				const res: any[] = [];

				ctx.on('onReset', (v) => {
					res.push([v, ctx.text]);
				});

				res.push(await ctx.reset());
				res.push(await ctx.reset());

				return res;
			})
		).toEqual([[undefined, ''], true, false]);

		await target.evaluate((ctx) => ctx.reset());

		test.expect(
			await target.evaluate((ctx) => ctx.value)
		).toBeUndefined();
	});

	test('clearing a component without the default value', async ({page}) => {
		const target = await renderSelect(page, {
			value: '10'
		});

		test.expect(
			await target.evaluate((ctx) => ctx.value)
		).toBe('10');

		test.expect(
			await target.evaluate(async (ctx) => {
				const res: any[] = [];

				ctx.on('onClear', (v) => {
					res.push([v, ctx.text]);
				});

				res.push(await ctx.clear());
				res.push(await ctx.clear());

				return res;
			})
		).toEqual([[undefined, ''], true, false]);

		test.expect(
			await target.evaluate((ctx) => ctx.value)
		).toBeUndefined();
	});

	test('resetting a component with the default value', async ({page}) => {
		const target = await renderSelect(page, {
			default: '10'
		});

		test.expect(
			await target.evaluate((ctx) => ctx.value)
		).toBe('10');

		await target.evaluate((ctx) => {
			ctx.value = '20';
		});

		test.expect(
			await target.evaluate((ctx) => ctx.value)
		).toBe('20');

		test.expect(
			await target.evaluate(async (ctx) => {
				const res: any[] = [];

				ctx.on('onReset', (v) => {
					res.push(v);
				});

				res.push(await ctx.reset());
				res.push(await ctx.reset());

				return res;
			})
		).toEqual(['10', true, false]);

		test.expect(
			await target.evaluate((ctx) => ctx.value)
		).toBe('10');
	});

	// FIXME: broken test
	test('listening the `change` event', async ({page}) => {
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
