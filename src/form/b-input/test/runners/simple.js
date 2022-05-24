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
	{initInput} = include('src/form/b-input/test/helpers');

/** @param {Page} page */
module.exports = (page) => {
	beforeEach(async () => {
		await page.evaluate(() => {
			globalThis.removeCreatedComponents();
		});
	});

	describe('b-input simple usage', () => {
		it('providing `value` and checking `text`', async () => {
			const target = await initInput(page, {
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
			const target = await initInput(page, {
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
			await initInput(page, {
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

			).toEqual(['INPUT', 'text', 'bla', 'baz']);
		});

		it('loading from a data provider', async () => {
			const
				target = await initInput(page, {name: 'baz', dataProvider: 'demo.InputValue'});

			expect(
				await target.evaluate((ctx) => [
					ctx.name,
					ctx.value
				])

			).toEqual(['baz', 'bar2']);
		});

		it('loading from a data provider and interpolation', async () => {
			const
				target = await initInput(page, {dataProvider: 'demo.Input'});

			expect(
				await target.evaluate((ctx) => [
					ctx.name,
					ctx.value,
					ctx.mods.someMod,
					ctx.mods.anotherMod
				])

			).toEqual(['foo', 'bar', 'bar', 'bla']);
		});

		describe('`textHint`', () => {
			it('providing a hint', async () => {
				const target = await initInput(page, {value: 'text', textHint: 'extra text'});

				expect(
					await target.evaluate((ctx) => ctx.$refs.textHint.value)
				).toBe('text extra text');

				expect(
					await target.evaluate((ctx) => {
						ctx.value = '10';
						return ctx.$refs.textHint.value;
					})
				).toBe('10 extra text');
			});

			it('should create a node for the passed hint text', async () => {
				const target = await initInput(page, {textHint: 'extra text'});

				expect(
					await target.evaluate((ctx) => ctx.$refs.textHint != null)
				).toBeTruthy();
			});

			it("shouldn't create a node if there is no hint passed", async () => {
				const target = await initInput(page);

				expect(
					await target.evaluate((ctx) => ctx.$refs.textHint == null)
				).toBeTruthy();
			});

			it('should hide a hint if the component input is empty', async () => {
				const target = await initInput(page, {textHint: 'extra text'});

				expect(
					await target.evaluate((ctx) => getComputedStyle(ctx.$refs.textHint).display)
				).toBe('none');
			});
		});
	});
};
