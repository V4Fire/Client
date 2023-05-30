/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { Page, JSHandle } from 'playwright';
import type bInput from 'components/form/b-input/b-input';

import test from 'tests/config/unit/test';
import Component from 'tests/helpers/component';

test.describe('<b-input> form API', () => {
	test.beforeEach(async ({demoPage}) => {
		await demoPage.goto();
	});

	test('passing component value as prop', async ({page}) => {
		const target = await renderInput(page, {
			value: '10'
		});

		test.expect(await target.evaluate((ctx) => ctx.value)).toBe('10');
	});

	test('passing default component value as prop', async ({page}) => {
		const target = await renderInput(page, {
			default: '10'
		});

		test.expect(await target.evaluate((ctx) => ctx.value)).toBe('10');
	});

	test('passing component value and default value as props', async ({page}) => {
		const target = await renderInput(page, {
			value: '5',
			default: '10'
		});

		test.expect(await target.evaluate((ctx) => ctx.value)).toBe('5');
	});

	test('getting component value from `formValue`', async ({page}) => {
		const target = await renderInput(page, {
			formValueConverter: [
				(val) => parseInt.option()(val),
				(val) => ((val) => Promise.resolve(val * 2)).option()(val),
				(val) => ((val) => val * 2).option()(val)
			]
		});

		test.expect(
			await target.evaluate((ctx) => ctx.formValue)
		).toBeNaN();

		await target.evaluate((ctx) => {
			ctx.value = '10';
		});

		test.expect(
			await target.evaluate((ctx) => ctx.formValue)
		).toBe(40);
	});

	test('getting component group value from `groupFormValue`', async ({page}) => {
		const target = await renderInput(page, {
			name: 'test',
			value: ['10', 'bar']
		});

		await target.evaluate((ctx) => {
			ctx.value = '';
		});

		test.expect(
			await target.evaluate((ctx) => ctx.groupFormValue)
		).toEqual(['', 'bar']);
	});

	test('resetting the input with no default value', async ({page}) => {
		const target = await renderInput(page, {
			value: '10'
		});

		test.expect(
			await target.evaluate((ctx) => ctx.value)
		).toBe('10');

		test.expect(
			await target.evaluate(async (ctx) => {
				const scan: unknown[] = [];
				ctx.on('onReset', (val) => scan.push(val));

				scan.push(await ctx.reset());
				scan.push(await ctx.reset());

				return scan;
			})
		).toEqual(['', true, false]);

		await target.evaluate((ctx) => ctx.reset());

		test.expect(
			await target.evaluate((ctx) => ctx.value)
		).toBe('');
	});

	test('resetting the input with the default value', async ({page}) => {
		const target = await renderInput(page, {
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
				const scan: unknown[] = [];
				ctx.on('onReset', (val) => scan.push(val));

				scan.push(await ctx.reset());
				scan.push(await ctx.reset());

				return scan;
			})
		).toEqual(['10', true, false]);

		test.expect(
			await target.evaluate((ctx) => ctx.value)
		).toBe('10');
	});

	test('the `change` event should be fired when the value of the component changes', async ({page}) => {
		const target = await renderInput(page);

		test.expect(
			await target.evaluate(async (ctx) => {
				const scan: unknown[] = [];
				ctx.on('onChange', (val) => scan.push(val));

				ctx.value = '1';
				ctx.value = '2';

				await ctx.nextTick();

				// eslint-disable-next-line require-atomic-updates
				ctx.value = '3';

				return scan;
			})

		).toEqual(['2', '3']);
	});

	/**
	 * @param page
	 * @param attrs
	 */
	async function renderInput(page: Page, attrs: RenderComponentsVnodeParams['attrs'] = {}): Promise<JSHandle<bInput>> {
		await Component.createComponent(page, 'b-input', [
			{
				attrs: {
					'data-id': 'target',
					...attrs,
					value: Object.isArray(attrs.value) ? attrs.value[0] : attrs.value
				}
			},

			{
				attrs: {
					'data-id': 'second',
					name: attrs.name,
					value: Object.isArray(attrs.value) ? attrs.value[1] : undefined
				}
			}
		]);

		return Component.waitForComponentStatus(page, '[data-id="target"]', 'ready');
	}
});
