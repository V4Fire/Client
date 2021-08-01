// @ts-check

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * @typedef {import('playwright').Page} Page
 */

const
	{initSelect} = include('src/form/b-select/test/helpers');

/** @param {Page} page */
module.exports = (page) => {
	beforeEach(async () => {
		await page.evaluate(() => {
			globalThis.removeCreatedComponents();
		});
	});

	describe('b-select simple usage', () => {
		it('providing `value` and checking `text`', async () => {
			const target = await initSelect(page, {
				value: 0,

				items: [
					{label: 'Foo', value: 0},
					{label: 'Bar', value: 1}
				]
			});

			expect(
				await target.evaluate((ctx) => {
					const
						res = [ctx.text];

					ctx.value = 1;
					res.push(ctx.text);

					return res;
				})
			).toEqual(['Foo', 'Bar']);
		});

		it('providing `text` and checking `value`', async () => {
			const target = await initSelect(page, {
				text: 'Foo',

				items: [
					{label: 'Foo', value: 0},
					{label: 'Bar', value: 1}
				]
			});

			expect(
				await target.evaluate((ctx) => {
					const
						res = [ctx.value];

					ctx.text = 'Bar';
					res.push(ctx.value);

					return res;
				})
			).toEqual([undefined, undefined]);
		});

		it('providing of attributes', async () => {
			await initSelect(page, {
				id: 'foo',
				name: 'bla',
				value: 'baz'
			});

			const
				input = await page.$('#foo');

			expect(
				await input.evaluate((ctx) => [
					ctx.tagName,
					ctx.type,
					ctx.name,
					ctx.value
				])

			).toEqual(['INPUT', 'text', 'bla', '']);
		});

		it('loading from a data provider', async () => {
			const
				target = await initSelect(page, {name: 'baz', dataProvider: 'demo.SelectValue'});

			expect(
				await target.evaluate((ctx) => [
					ctx.name,
					ctx.value
				])

			).toEqual(['baz', '0']);
		});

		it('loading from a data provider and interpolation', async () => {
			const
				target = await initSelect(page, {dataProvider: 'demo.Select'});

			expect(
				await target.evaluate((ctx) => [
					ctx.name,
					ctx.value,
					ctx.mods.someMod,
					ctx.mods.anotherMod
				])

			).toEqual(['foo', 0, 'bar', 'bla']);
		});

		describe('providing `items`', () => {
			it("shouldn't be rendered until the component open", async () => {
				const target = await initSelect(page, {
					items: [
						{label: 'Foo', value: 0},
						{label: 'Bar', value: 1}
					]
				});

				expect(await target.evaluate((ctx) => Boolean(ctx.block.element('dropdown'))))
					.toBeFalse();

				expect(
					await target.evaluate(async (ctx) => {
						await ctx.open();
						return Array.from(ctx.block.element('dropdown').children).map((el) => [
							el.tagName,
							el.innerText
						]);
					})
				).toEqual([
					['SPAN', 'Foo'],
					['SPAN', 'Bar']
				]);
			});

			it('should be rendered to a native <select>', async () => {
				const target = await initSelect(page, {
					native: true,

					items: [
						{label: 'Foo', value: 0},
						{label: 'Bar', value: 1}
					]
				});

				expect(await target.evaluate((ctx) => ctx.block.element('input').tagName))
					.toBe('SELECT');

				expect(
					await target.evaluate((ctx) => Array.from(ctx.block.element('input').children).map((el) => [
						el.tagName,
						el.innerText
					]))
				).toEqual([
					['OPTION', 'Foo'],
					['OPTION', 'Bar']
				]);
			});

			describe('providing `selected`', () => {
				it('should set a component value based on `selected` items', async () => {
					const target = await initSelect(page, {
						items: [
							{label: 'Foo', value: 0, selected: true},
							{label: 'Bar', value: 1}
						]
					});

					expect(await target.evaluate((ctx) => ctx.value)).toBe(0);
				});

				it("shouldn't set a component value based on `selected` items", async () => {
					const target = await initSelect(page, {
						value: 1,

						items: [
							{label: 'Foo', value: 0, selected: true},
							{label: 'Bar', value: 1}
						]
					});

					expect(await target.evaluate((ctx) => ctx.value)).toBe(1);
				});

				it('should set a component value based on the last `selected` item', async () => {
					const target = await initSelect(page, {
						items: [
							{label: 'Foo', value: 0, selected: true},
							{label: 'Bar', value: 1, selected: true}
						]
					});

					expect(await target.evaluate((ctx) => ctx.value)).toBe(1);
				});

				it('should set a component `multiple` value based on `selected` items', async () => {
					const target = await initSelect(page, {
						multiple: true,

						items: [
							{label: 'Foo', value: 0, selected: true},
							{label: 'Bar', value: 1, selected: true}
						]
					});

					expect(await target.evaluate((ctx) => [...ctx.value])).toEqual([0, 1]);
				});
			});
		});

		describe('API to select values', () => {
			it('`isSelected`', async () => {
				const target = await initSelect(page, {
					items: [
						{label: 'Foo', value: 0, selected: true},
						{label: 'Bar', value: 1}
					]
				});

				expect(await target.evaluate((ctx) => ctx.isSelected(0))).toBeTrue();
				expect(await target.evaluate((ctx) => ctx.isSelected(1))).toBeFalse();
			});

			it('`isSelected` with `multiple`', async () => {
				const target = await initSelect(page, {
					multiple: true,

					items: [
						{label: 'Foo', value: 0, selected: true},
						{label: 'Bar', value: 1, selected: true},
						{label: 'Baz', value: 3}
					]
				});

				expect(await target.evaluate((ctx) => ctx.isSelected(0))).toBeTrue();
				expect(await target.evaluate((ctx) => ctx.isSelected(1))).toBeTrue();
				expect(await target.evaluate((ctx) => ctx.isSelected(2))).toBeFalse();
			});

			it('`selectValue`', async () => {
				const target = await initSelect(page, {
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

				expect(scan).toEqual([
					undefined,
					[true, 0],
					[false, 0],
					[true, 1]
				]);
			});

			it('`selectValue` with `multiple`', async () => {
				const target = await initSelect(page, {
					multiple: true,

					items: [
						{label: 'Foo', value: 0},
						{label: 'Bar', value: 1}
					]
				});

				const scan = await target.evaluate((ctx) => {
					const res = [undefined];

					res.push([ctx.selectValue(0), [...ctx.value]]);
					res.push([ctx.selectValue(0), [...ctx.value]]);
					res.push([ctx.selectValue(1), [...ctx.value]]);
					res.push([ctx.selectValue(1, true), [...ctx.value]]);

					return res;
				});

				expect(scan).toEqual([
					undefined,
					[true, [0]],
					[false, [0]],
					[true, [0, 1]],
					[true, [1]]
				]);
			});

			it('`unselectValue`', async () => {
				const target = await initSelect(page, {
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

				expect(scan).toEqual([
					0,
					[true, undefined],
					[false, undefined]
				]);
			});

			it('`unselectValue` with `multiple`', async () => {
				const target = await initSelect(page, {
					multiple: true,

					items: [
						{label: 'Foo', value: 0, selected: true},
						{label: 'Bar', value: 1, selected: true}
					]
				});

				const scan = await target.evaluate((ctx) => {
					const res = [[...ctx.value]];

					res.push([ctx.unselectValue(0), [...ctx.value]]);
					res.push([ctx.unselectValue(0), [...ctx.value]]);
					res.push([ctx.unselectValue(1), ctx.value]);

					return res;
				});

				expect(scan).toEqual([
					[0, 1],
					[true, [1]],
					[false, [1]],
					[true, undefined]
				]);
			});

			it('`toggleValue`', async () => {
				const target = await initSelect(page, {
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

				expect(scan).toEqual([
					0,
					undefined,
					0,
					1
				]);
			});

			it('`toggleValue` with `multiple`', async () => {
				const target = await initSelect(page, {
					multiple: true,

					items: [
						{label: 'Foo', value: 0, selected: true},
						{label: 'Bar', value: 1}
					]
				});

				const scan = await target.evaluate((ctx) => {
					const res = [[...ctx.value]];

					res.push(ctx.toggleValue(0));
					res.push([...ctx.toggleValue(0)]);
					res.push([...ctx.toggleValue(1)]);
					res.push(ctx.toggleValue(0, true));

					return res;
				});

				expect(scan).toEqual([
					[0],
					undefined,
					[0],
					[0, 1],
					undefined
				]);
			});
		});
	});
};
