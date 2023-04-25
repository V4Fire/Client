/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { ElementHandle } from 'playwright';

import test from 'tests/config/unit/test';

import { BOM } from 'tests/helpers';

import { renderSelect } from 'components/form/b-select/test/helpers';

// eslint-disable-next-line max-lines-per-function
test.describe('<b-select> simple usage', () => {

	test.beforeEach(async ({demoPage}) => {
		await demoPage.goto();
	});

	test('providing `value` and checking `text`', async ({page}) => {
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

	test('providing `text` and checking `value`', async ({page}) => {
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

	test('providing of attributes', async ({page}) => {
		await renderSelect(page, {
			id: 'foo',
			name: 'bla',
			value: 'baz'
		});

		const input = <ElementHandle<HTMLInputElement>>(await page.$('#foo'));
		const mainAttributes = input.evaluate((ctx) => [
			ctx.tagName,
			ctx.type,
			ctx.name,
			ctx.value
		]);

		await test.expect(mainAttributes).resolves.toEqual(['INPUT', 'text', 'bla', '']);
	});

	test.describe('`dataProvider`', () => {
		test('loading from a data provider', async ({page}) => {
			await page.route(/api/, async (route) => route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: '0'
			}));

			const target = await renderSelect(page, {name: 'baz', dataProvider: 'Provider'});

			await BOM.waitForIdleCallback(page, {sleepAfterIdles: 1000});

			await test.expect(
				target.evaluate((ctx) => [
					ctx.name,
					ctx.value
				])
			).resolves.toEqual(['baz', 0]);
		});

		test('loading from a data provider and interpolation', async ({page}) => {
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

			await BOM.waitForIdleCallback(page);

			await test.expect(
				target.evaluate((ctx) => [
					ctx.value,
					ctx.mods.someMod,
					ctx.mods.anotherMod
				])
			).resolves.toEqual([0, 'bar', 'bla']);
		});
	});

	test.describe('providing `items`', () => {
		test('shouldn\'t be rendered until the component open', async ({page}) => {
			const target = await renderSelect(page, {
				items: [
					{label: 'Foo', value: 0},
					{label: 'Bar', value: 1}
				]
			});

			await test.expect(target.evaluate((ctx) => Boolean(ctx.unsafe.block!.element('dropdown'))))
				.resolves.toBeFalsy();

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

		test('should be rendered to a native <select>', async ({page}) => {
			const target = await renderSelect(page, {
				native: true,

				items: [
					{label: 'Foo', value: 0},
					{label: 'Bar', value: 1}
				]
			});

			await test.expect(target.evaluate((ctx) => ctx.unsafe.block!.element('input')!.tagName))
				.resolves.toBe('SELECT');

			await test.expect(
				target.evaluate((ctx) => Array.from(ctx.unsafe.block!.element('input')!.children).map((el) => [
					el.tagName,
					el.textContent
				]))
			).resolves.toEqual([
				['OPTION', 'Foo'],
				['OPTION', 'Bar']
			]);
		});

		test.describe('providing `selected`', () => {
			test('should set a component value based on `selected` items', async ({page}) => {
				const target = await renderSelect(page, {
					items: [
						{label: 'Foo', value: 0, selected: true},
						{label: 'Bar', value: 1}
					]
				});

				await test.expect(target.evaluate((ctx) => ctx.value)).resolves.toEqual(0);
			});

			test('shouldn\'t set a component value based on `selected` items', async ({page}) => {
				const target = await renderSelect(page, {
					value: 1,

					items: [
						{label: 'Foo', value: 0, selected: true},
						{label: 'Bar', value: 1}
					]
				});

				await test.expect(target.evaluate((ctx) => ctx.value)).resolves.toEqual(1);
			});

			test('should set a component value based on the last `selected` item', async ({page}) => {
				const target = await renderSelect(page, {
					items: [
						{label: 'Foo', value: 0, selected: true},
						{label: 'Bar', value: 1, selected: true}
					]
				});

				await test.expect(target.evaluate((ctx) => ctx.value)).resolves.toEqual(1);
			});

			test('should set a component `multiple` value based on `selected` items', async ({page}) => {
				const target = await renderSelect(page, {
					multiple: true,

					items: [
						{label: 'Foo', value: 0, selected: true},
						{label: 'Bar', value: 1, selected: true}
					]
				});

				await test.expect(target.evaluate((ctx) => [...<number[]>ctx.value])).resolves.toEqual([0, 1]);
			});
		});
	});

	test.describe('API to select values', () => {
		test('`isSelected`', async ({page}) => {
			const target = await renderSelect(page, {
				items: [
					{label: 'Foo', value: 0, selected: true},
					{label: 'Bar', value: 1}
				]
			});

			await test.expect(target.evaluate((ctx) => ctx.isSelected(0))).resolves.toBeTruthy();
			await test.expect(target.evaluate((ctx) => ctx.isSelected(1))).resolves.toBeFalsy();
		});

		test('`isSelected` with `multiple`', async ({page}) => {
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

		test('`selectValue`', async ({page}) => {
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

		test('`selectValue` with `multiple`', async ({page}) => {
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

		test('`unselectValue`', async ({page}) => {
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

		test('`unselectValue` with `multiple`', async ({page}) => {
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

		test('`toggleValue`', async ({page}) => {
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

		test('`toggleValue` with `multiple`', async ({page}) => {
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
