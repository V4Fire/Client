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
		xit('providing `value` and checking `text`', async () => {
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

		xit('providing `text` and checking `value`', async () => {
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

		xit('providing of attributes', async () => {
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

		xit('loading from a data provider', async () => {
			const
				target = await initInput(page, {name: 'baz', dataProvider: 'demo.InputValue'});

			expect(
				await target.evaluate((ctx) => [
					ctx.name,
					ctx.value
				])

			).toEqual(['baz', 'bar2']);
		});

		xit('loading from a data provider and interpolation', async () => {
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

		it('hide additional phrase if it not provided', async () => {
			const target = await initInput(page);

			expect(
				await target.evaluate((ctx) => ctx.$refs.textHint == null)
			).toBeTruthy();
		});

		it('show additional phrase if it provided', async () => {
			const target = await initInput(page, {textHint: 'extra text'});

			expect(
				await target.evaluate((ctx) => ctx.$refs.textHint != null)
			).toBeTruthy();
		});

		it('value of additional phrase input', async () => {
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

		it('additional input can not be focused', async () => {
			const target = await initInput(page, {value: 'text', textHint: 'extra text'});

			expect(
				await target.evaluate((ctx) => {
					const {textHint, input} = ctx.$refs;
					textHint.dispatchEvent(new FocusEvent('focus', {data: textHint}));
					return document.activeElement === input;
				})
			).toBeTruthy();
		});

		it('additional input can not be focused by click', async () => {
			const target = await initInput(page, {value: 'text', textHint: 'extra text'});

			expect(
				await target.evaluate((ctx) => {
					const {textHint, input} = ctx.$refs;
					textHint.dispatchEvent(new Event('click', {data: textHint}));
					return document.activeElement === input;
				})
			).toBeTruthy();
		});

		it('additional input has "display: none" if value empty ', async () => {
			const target = await initInput(page, {textHint: 'extra text'});

			expect(
				await target.evaluate((ctx) => getComputedStyle(ctx.$refs.textHint).display)
			).toBe('none');
		});
	});
};
