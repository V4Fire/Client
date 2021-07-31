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
	h = include('tests/helpers');

/** @param {Page} page */
module.exports = (page) => {
	beforeEach(async () => {
		await page.evaluate(() => {
			globalThis.removeCreatedComponents();
		});
	});

	describe('b-checkbox simple usage', () => {
		const
			q = '[data-id="target"]';

		it('providing of attributes', async () => {
			await init({id: 'foo', name: 'bla'});

			const
				input = await page.$('#foo');

			expect(
				await input.evaluate((ctx) => [
					ctx.tagName,
					ctx.type,
					ctx.name,
					ctx.checked
				])

			).toEqual(['INPUT', 'checkbox', 'bla', false]);
		});

		it('checked checkbox', async () => {
			const target = await init({checked: true, value: 'bar'});

			expect(
				await target.evaluate((ctx) => ctx.value)
			).toBe('bar');
		});

		it('non-changeable checkbox', async () => {
			const target = await init({changeable: false});

			expect(
				await target.evaluate((ctx) => ctx.value)
			).toBeUndefined();

			await page.click(q);

			expect(
				await target.evaluate((ctx) => ctx.value)
			).toBeTrue();

			await page.click(q);

			expect(
				await target.evaluate((ctx) => ctx.value)
			).toBeTrue();

			expect(
				await target.evaluate((ctx) => ctx.uncheck())
			).toBeTrue();

			expect(
				await target.evaluate((ctx) => ctx.value)
			).toBeUndefined();
		});

		it('checking a non-defined value (user actions)', async () => {
			const target = await init();

			expect(
				await target.evaluate((ctx) => ctx.value)
			).toBeUndefined();

			await page.click(q);

			expect(
				await target.evaluate((ctx) => ctx.value)
			).toBeTrue();

			await page.click(q);

			expect(
				await target.evaluate((ctx) => ctx.value)
			).toBeUndefined();
		});

		it('checking a predefined value (user actions)', async () => {
			const target = await init({value: 'bar'});

			expect(
				await target.evaluate((ctx) => ctx.value)
			).toBeUndefined();

			await page.click(q);

			expect(
				await target.evaluate((ctx) => ctx.value)
			).toBe('bar');

			await page.click(q);

			expect(
				await target.evaluate((ctx) => ctx.value)
			).toBeUndefined();
		});

		it('checking a non-defined value (API)', async () => {
			const target = await init();

			expect(
				await target.evaluate((ctx) => ctx.value)
			).toBeUndefined();

			expect(
				await target.evaluate((ctx) => ctx.check())
			).toBeTrue();

			expect(
				await target.evaluate((ctx) => ctx.value)
			).toBeTrue();

			expect(
				await target.evaluate((ctx) => ctx.uncheck())
			).toBeTrue();

			expect(
				await target.evaluate((ctx) => ctx.value)
			).toBeUndefined();

			expect(
				await target.evaluate((ctx) => ctx.toggle())
			).toBeTrue();

			expect(
				await target.evaluate((ctx) => ctx.toggle())
			).toBeUndefined();
		});

		it('checking a predefined value (API)', async () => {
			const target = await init({value: 'bar'});

			expect(
				await target.evaluate((ctx) => ctx.value)
			).toBeUndefined();

			expect(
				await target.evaluate((ctx) => ctx.check())
			).toBeTrue();

			expect(
				await target.evaluate((ctx) => ctx.value)
			).toBe('bar');

			expect(
				await target.evaluate((ctx) => ctx.uncheck())
			).toBeTrue();

			expect(
				await target.evaluate((ctx) => ctx.value)
			).toBeUndefined();

			expect(
				await target.evaluate((ctx) => ctx.toggle())
			).toBe('bar');

			expect(
				await target.evaluate((ctx) => ctx.toggle())
			).toBeUndefined();
		});

		it('checkbox with a `label` prop', async () => {
			const target = await init({
				label: 'Foo'
			});

			expect(
				await target.evaluate((ctx) => ctx.block.element('label').textContent.trim())
			).toEqual('Foo');

			const selector = await target.evaluate(
				(ctx) => `.${ctx.block.element('label').className.split(' ').join('.')}`
			);

			await page.click(selector);

			expect(
				await target.evaluate((ctx) => ctx.value)
			).toBeTrue();
		});

		async function init(attrs = {}) {
			await page.evaluate((attrs) => {
				const scheme = [
					{
						attrs: {
							'data-id': 'target',
							...attrs
						}
					}
				];

				globalThis.renderComponents('b-checkbox', scheme);
			}, attrs);

			return h.component.waitForComponent(page, q);
		}
	});
};
