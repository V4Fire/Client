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
			).toEqual(['baz', 'baz']);
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
	});
};
