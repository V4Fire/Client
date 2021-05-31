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
	h = include('tests/helpers');

/** @param {Page} page */
module.exports = (page) => {
	beforeEach(async () => {
		await page.evaluate(() => {
			globalThis.removeCreatedComponents();
		});
	});

	describe('b-input-hidden simple usage', () => {
		const
			q = '[data-id="target"]';

		const init = async (attrs = {}) => {
			await page.evaluate((attrs) => {
				const scheme = [
					{
						attrs: {
							'data-id': 'target',
							...attrs
						}
					}
				];

				globalThis.renderComponents('b-input-hidden', scheme);
			}, attrs);

			return h.component.waitForComponent(page, q);
		};

		it('providing of attributes', async () => {
			await init({
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

			).toEqual(['INPUT', 'hidden', 'bla', 'baz']);
		});

		it('checking the visibility', async () => {
			const
				target = await init({name: 'bla', value: 'baz'});

			expect(
				await target.evaluate((ctx) => [
					ctx.$el.offsetHeight,
					ctx.$el.offsetWidth
				])

			).toEqual([0, 0]);
		});

		it('loading from a data provider', async () => {
			const
				target = await init({name: 'baz', dataProvider: 'demo.InputValue'});

			expect(
				await target.evaluate((ctx) => [
					ctx.name,
					ctx.value
				])

			).toEqual(['baz', 'bar2']);
		});

		it('loading from a data provider and interpolation', async () => {
			const
				target = await init({dataProvider: 'demo.Input'});

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
