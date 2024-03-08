/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { Page } from 'playwright';

import { Component } from 'tests/helpers';
import test from 'tests/config/unit/test';

import { assertValueIs, createSelector, renderSelect, selectValue } from 'components/form/b-select/test/helpers';

// eslint-disable-next-line max-lines-per-function
test.describe('<b-select> simple usage', () => {
	test.beforeEach(async ({demoPage}) => {
		await demoPage.goto();
	});

	test('`text` should change when `value` is changed', async ({page}) => {
		const target = await renderSelect(page, {
			value: 0,
			items: [
				{label: 'Foo', value: 0},
				{label: 'Bar', value: 1}
			]
		});

		const textChanges = target.evaluate((ctx) => {
			const {text} = ctx;

			ctx.value = 1;

			return [text, ctx.text];
		});

		await test.expect(textChanges).resolves.toEqual(['Foo', 'Bar']);
	});

	test.describe('`text` should match the selected value', () => {
		test('with `native = true`', textShouldMatchValue({native: true}));

		test('with `native = false`', textShouldMatchValue({native: false}));

		function textShouldMatchValue(opts: {native: boolean}) {
			return async ({page}: {page: Page}) => {
				const target = await renderSelect(page, {
					value: 0,
					...opts,
					items: [
						{label: 'Foo', value: 0},
						{label: 'Bar', value: 1}
					]
				});

				await selectValue(page, target, 'Bar');

				await test.expect(target.evaluate((ctx) => ctx.text)).toBeResolvedTo('Bar');
			};
		}
	});

	test('`value` of the <select> should match with the selected option', async ({page}) => {
		await renderSelect(page, {
			native: true,

			items: [
				{label: 'Foo', value: 0},
				{label: 'Bar', value: 1}
			]
		});

		const selectLocator = page.locator(`select${createSelector('input')}`);

		await selectLocator.selectOption({label: 'Bar'});
		await test.expect(selectLocator).toHaveValue('Bar');
	});

	test('`value` should not change when `text` is changed', async ({page}) => {
		const target = await renderSelect(page, {
			text: 'Foo',
			items: [
				{label: 'Foo', value: 0},
				{label: 'Bar', value: 1}
			]
		});

		const textChanges = target.evaluate((ctx) => {
			const {value} = ctx;

			ctx.text = 'Bar';

			return [value, ctx.value];
		});

		await test.expect(textChanges).resolves.toEqual([undefined, undefined]);
	});

	test('html attributes of the <input> can be set via component props', async ({page}) => {
		await renderSelect(page, {
			id: 'foo',
			name: 'bla',
			value: 'baz'
		});

		const input = page.locator('#foo');
		const mainAttributes = input.evaluate((ctx: HTMLInputElement) => [
			ctx.tagName,
			ctx.type,
			ctx.name,
			ctx.value
		]);

		// NOTE: value of the input is an empty string, because select doesn't have any items
		await test.expect(mainAttributes).resolves.toEqual(['INPUT', 'text', 'bla', '']);
	});

	test.describe('`dataProvider`', () => {
		test('should load `value` from a data provider', async ({page}) => {
			await page.route(/api/, async (route) => route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: '0'
			}));

			const target = await renderSelect(page, {name: 'baz', dataProvider: 'Provider'});

			await test.expect(
				target.evaluate((ctx) => [
					ctx.name,
					ctx.value
				])
			).resolves.toEqual(['baz', 0]);
		});

		test('should load `items` and other attributes from a data provider', async ({page}) => {
			await page.route(/api/, async (route) => route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify({
					items: [
						{label: 'Foo', value: 0, selected: true},
						{label: 'Bar', value: 1}
					],

					'mods.someMod': 'bar',
					setMod: ['anotherMod', 'bla']
				})
			}));

			const target = await renderSelect(page, {dataProvider: 'Provider'});

			await test.expect(
				target.evaluate((ctx) => [
					ctx.value,
					ctx.mods.someMod,
					ctx.mods.anotherMod
				])
			).resolves.toEqual([0, 'bar', 'bla']);
		});
	});

	test.describe('`items`', () => {
		test('should not be rendered until the dropdown is opened', async ({page}) => {
			const target = await renderSelect(page, {
				items: [
					{label: 'Foo', value: 0},
					{label: 'Bar', value: 1}
				]
			});

			await test.expect(page.locator(createSelector('dropdown')).isHidden()).resolves.toBeTruthy();

			await test.expect(
				target.evaluate(async (ctx) => {
					await ctx.open();
					return Array.from(ctx.unsafe.block!.element('dropdown')!.children).map((el) => [
						el.tagName,
						el.textContent
					]);
				})
			).resolves.toEqual([
				['SPAN', 'Foo'],
				['SPAN', 'Bar']
			]);
		});

		test('should close the dropdown when click on an element with .stopPropagation', async ({page}) => {
			const btnText = 'buttonWithStopPropagation';
			await Component.createComponent(page, 'b-button', {
				children: {
					default: btnText
				}
			});

			const target = await renderSelect(page, {
				items: [
					{label: 'Foo', value: 0},
					{label: 'Bar', value: 1}
				]
			});

			await target.evaluate((ctx) => ctx.open());
			await test.expect(page.locator(createSelector('dropdown')).isVisible()).resolves.toBeTruthy();

			await page.getByText(btnText).click();
			await test.expect(page.locator(createSelector('dropdown')).isHidden()).resolves.toBeTruthy();
		});

		test('should be rendered to a native <select> with `native = true`', async ({page}) => {
			const target = await renderSelect(page, {
				native: true,

				items: [
					{label: 'Foo', value: 0},
					{label: 'Bar', value: 1}
				]
			});

			await test.expect(target.evaluate((ctx) => ctx.unsafe.block!.element('input')!.tagName))
				.toBeResolvedTo('SELECT');

			await test.expect(
				page.locator(createSelector('input')).getByRole('option')
			).toHaveText(['Foo', 'Bar']);
		});

		test.describe('items with `selected` property', () => {
			test('should set component\'s `value` based on the `selected` items', async ({page}) => {
				const target = await renderSelect(page, {
					items: [
						{label: 'Foo', value: 0, selected: true},
						{label: 'Bar', value: 1}
					]
				});

				await assertValueIs(target, 0);
			});

			test('should ignore `selected` items when the `value` prop is provided', async ({page}) => {
				const target = await renderSelect(page, {
					value: 1,

					items: [
						{label: 'Foo', value: 0, selected: true},
						{label: 'Bar', value: 1}
					]
				});

				await assertValueIs(target, 1);
			});

			test('should set component\'s `value` based on the last `selected` item', async ({page}) => {
				const target = await renderSelect(page, {
					items: [
						{label: 'Foo', value: 0, selected: true},
						{label: 'Bar', value: 1, selected: true}
					]
				});

				await assertValueIs(target, 1);
			});

			test('should set component\'s `value` based on all `selected` items with `multiple = true`', async ({page}) => {
				const target = await renderSelect(page, {
					multiple: true,

					items: [
						{label: 'Foo', value: 0, selected: true},
						{label: 'Bar', value: 1, selected: true}
					]
				});

				await assertValueIs(target, [0, 1]);
			});
		});
	});

	test.describe('API to select values', () => {
		test('`isSelected` should accept item\'s value and return it\'s state: selected or unselected', async ({page}) => {
			const target = await renderSelect(page, {
				items: [
					{label: 'Foo', value: 0, selected: true},
					{label: 'Bar', value: 1}
				]
			});

			await test.expect(target.evaluate((ctx) => ctx.isSelected(0))).resolves.toBeTruthy();
			await test.expect(target.evaluate((ctx) => ctx.isSelected(1))).resolves.toBeFalsy();
		});

		test('`isSelected` with `multiple = true` should accept item\'s value and return it\'s state: selected or unselected', async ({page}) => {
			const target = await renderSelect(page, {
				multiple: true,

				items: [
					{label: 'Foo', value: 0, selected: true},
					{label: 'Bar', value: 1, selected: true},
					{label: 'Baz', value: 3}
				]
			});

			await test.expect(target.evaluate((ctx) => ctx.isSelected(0))).resolves.toBeTruthy();
			await test.expect(target.evaluate((ctx) => ctx.isSelected(1))).resolves.toBeTruthy();
			await test.expect(target.evaluate((ctx) => ctx.isSelected(2))).resolves.toBeFalsy();
		});

		test([
			'`selectValue` should update the `value` of a component and return `false`',
			'if provided value is already set, otherwise it should return `true`'
		].join(' '), async ({page}) => {
			const target = await renderSelect(page, {
				items: [
					{label: 'Foo', value: 0},
					{label: 'Bar', value: 1}
				]
			});

			const scan = await target.evaluate((ctx) => {
				const res = [ctx.value];

				res.push([ctx.selectValue(0), ctx.value]);
				res.push([ctx.selectValue(0), ctx.value]);
				res.push([ctx.selectValue(1), ctx.value]);

				return res;
			});

			test.expect(scan).toEqual([
				undefined,
				[true, 0],
				[false, 0],
				[true, 1]
			]);
		});

		test('`selectValue` with `multiple = true` should add provided value to the `value` of a component', async ({page}) => {
			const target = await renderSelect(page, {
				multiple: true,

				items: [
					{label: 'Foo', value: 0},
					{label: 'Bar', value: 1}
				]
			});

			const scan = await target.evaluate((ctx) => {
				const res: any[] = [undefined];

				const value = () => [...<number[]>ctx.value];

				res.push([ctx.selectValue(0), value()]);
				res.push([ctx.selectValue(0), value()]);
				res.push([ctx.selectValue(1), value()]);
				res.push([ctx.selectValue(1, true), value()]);

				return res;
			});

			test.expect(scan).toEqual([
				undefined,
				[true, [0]],
				[false, [0]],
				[true, [0, 1]],
				[true, [1]]
			]);
		});

		test([
			'`unselectValue` should remove provided value from the component\'s `value` and return `false`',
			'if provided value was not set, otherwise it should return `true`'
		].join(' '), async ({page}) => {
			const target = await renderSelect(page, {
				items: [
					{label: 'Foo', value: 0, selected: true},
					{label: 'Bar', value: 1}
				]
			});

			const scan = await target.evaluate((ctx) => {
				const res = [ctx.value];

				res.push([ctx.unselectValue(0), ctx.value]);
				res.push([ctx.unselectValue(0), ctx.value]);

				return res;
			});

			test.expect(scan).toEqual([
				0,
				[true, undefined],
				[false, undefined]
			]);
		});

		test('`unselectValue` with `multiple = true` should remove provided value from the `value` of a component', async ({page}) => {
			const target = await renderSelect(page, {
				multiple: true,

				items: [
					{label: 'Foo', value: 0, selected: true},
					{label: 'Bar', value: 1, selected: true}
				]
			});

			const scan = await target.evaluate((ctx) => {
				const res: any[] = [[...<number[]>ctx.value]];

				res.push([ctx.unselectValue(0), [...<number[]>ctx.value]]);
				res.push([ctx.unselectValue(0), [...<number[]>ctx.value]]);
				res.push([ctx.unselectValue(1), ctx.value]);

				return res;
			});

			test.expect(scan).toEqual([
				[0, 1],
				[true, [1]],
				[false, [1]],
				[true, undefined]
			]);
		});

		test([
			'`toggleValue` should toggle provided value in the component\'s `value`',
			'and return current `value` of the component'
		].join(' '), async ({page}) => {
			const target = await renderSelect(page, {
				items: [
					{label: 'Foo', value: 0, selected: true},
					{label: 'Bar', value: 1}
				]
			});

			const scan = await target.evaluate((ctx) => {
				const res = [ctx.value];

				res.push(ctx.toggleValue(0));
				res.push(ctx.toggleValue(0));
				res.push(ctx.toggleValue(1));

				return res;
			});

			test.expect(scan).toEqual([0, undefined, 0, 1]);
		});

		test([
			'`toggleValue` with `multiple = true` should add or remove provided value to the component\'s `value`',
			'and return current `value` of the component'
		].join(' '), async ({page}) => {
			const target = await renderSelect(page, {
				multiple: true,

				items: [
					{label: 'Foo', value: 0, selected: true},
					{label: 'Bar', value: 1}
				]
			});

			const scan = await target.evaluate((ctx) => {
				const res: any[] = [[...<number[]>ctx.value]];

				res.push(ctx.toggleValue(0));
				res.push([...<number[]>ctx.toggleValue(0)]);
				res.push([...<number[]>ctx.toggleValue(1)]);
				res.push([...<number[]>ctx.toggleValue(0, true)]);

				return res;
			});

			test.expect(scan).toEqual([
				[0],
				undefined,
				[0],
				[0, 1],
				[0]
			]);
		});
	});
});
