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
	{initTextarea} = include('src/form/b-textarea/test/helpers');

/** @param {Page} page */
module.exports = (page) => {
	beforeEach(async () => {
		await page.evaluate(() => {
			globalThis.removeCreatedComponents();
		});
	});

	describe('b-textarea simple usage', () => {
		it('providing `value` and checking `text`', async () => {
			const target = await initTextarea(page, {
				value: 'baz'
			});

			expect(
				await target.evaluate((ctx) => {
					const
						res = [ctx.text];

					ctx.value = 'bla';
					res.push(ctx.text);

					return res;
				})
			).toEqual(['baz', 'bla']);
		});

		it('providing `text` and checking `value`', async () => {
			const target = await initTextarea(page, {
				text: 'baz'
			});

			expect(
				await target.evaluate((ctx) => {
					const
						res = [ctx.value];

					ctx.text = 'bla';
					res.push(ctx.value);

					return res;
				})
			).toEqual(['baz', 'bla']);
		});

		it('providing of attributes', async () => {
			await initTextarea(page, {
				id: 'foo',
				name: 'bla',
				value: 'baz'
			});

			const
				input = await page.$('#foo');

			expect(
				await input.evaluate((ctx) => [
					ctx.tagName,
					ctx.name,
					ctx.value
				])

			).toEqual(['TEXTAREA', 'bla', 'baz']);
		});

		it('loading from a data provider', async () => {
			const
				target = await initTextarea(page, {name: 'baz', dataProvider: 'demo.InputValue'});

			expect(
				await target.evaluate((ctx) => [
					ctx.name,
					ctx.value
				])

			).toEqual(['baz', 'bar2']);
		});

		it('loading from a data provider and interpolation', async () => {
			const
				target = await initTextarea(page, {dataProvider: 'demo.Input'});

			expect(
				await target.evaluate((ctx) => [
					ctx.name,
					ctx.value,
					ctx.mods.someMod,
					ctx.mods.anotherMod
				])

			).toEqual(['foo', 'bar', 'bar', 'bla']);
		});

		it('auto resizing', async () => {
			const target = await initTextarea(page);

			expect(
				await target.evaluate(async (ctx) => {
					const {input} = ctx.$refs;
					input.style.maxHeight = '100px';

					const
						res = [];

					const values = [
						'',
						'bla\nbla\nbla\n',
						'bla\nbla\nbla\nbla\nbla\nbla\n',
						'bla\nbla\nbla\nbla\nbla\nbla\nbla\nbla\nbla\n',
						'bla\nbla\nbla\n',
						''
					];

					for (const value of values) {
						ctx.value = value;
						await ctx.nextTick();
						res.push([input.clientHeight, input.scrollHeight]);
					}

					return res;
				})
			).toEqual([
				[36, 36],
				[72, 72],
				[98, 126],
				[98, 180],
				[72, 72],
				[36, 36]
			]);
		});

		it('providing `maxLength` and `messageHelpers`', async () => {
			const target = await initTextarea(page, {
				maxLength: 20,
				messageHelpers: true
			});

			expect(
				await target.evaluate(async (ctx) => {
					const
						res = [],
						limitEl = ctx.block.element('limit');

					const values = [
						'',
						'bla',
						'bla bla',
						'bla bla bla bla',
						'bla bla bla bla bla bla bla bla',
						'bla bla bla',
						''
					];

					for (const value of values) {
						ctx.value = value;
						await ctx.nextTick();

						res.push([
							limitEl.innerText,
							ctx.block.getElMod(limitEl, 'limit', 'hidden'),
							ctx.block.getElMod(limitEl, 'limit', 'warning')
						]);
					}

					return res;
				})
			).toEqual([
				['', 'true', undefined],
				['', 'true', undefined],
				['Characters left: 13', 'false', 'false'],
				['Characters left: 5', 'false', 'true'],
				['Characters left: 0', 'false', 'true'],
				['Characters left: 9', 'false', 'false'],
				['Characters left: 9', 'true', 'false']
			]);
		});

		it('providing `maxLength` and the `limit` slot', async () => {
			const target = await initTextarea(page, {
				maxLength: 20,
				limit: 'return ({limit, maxLength}) => "Characters left: " + limit + ". The maximum characters is " + maxLength'
			});

			expect(
				await target.evaluate(async (ctx) => {
					const
						res = [],
						limitEl = ctx.block.element('limit');

					const values = [
						'',
						'bla',
						'bla bla',
						'bla bla bla bla',
						'bla bla bla bla bla bla bla bla',
						'bla bla bla',
						''
					];

					for (const value of values) {
						ctx.value = value;
						await ctx.nextTick();

						res.push(limitEl.innerText);
					}

					return res;
				})
			).toEqual([
				'Characters left: 20. The maximum characters is 20',
				'Characters left: 17. The maximum characters is 20',
				'Characters left: 13. The maximum characters is 20',
				'Characters left: 5. The maximum characters is 20',
				'Characters left: 0. The maximum characters is 20',
				'Characters left: 9. The maximum characters is 20',
				'Characters left: 20. The maximum characters is 20'
			]);
		});
	});
};
