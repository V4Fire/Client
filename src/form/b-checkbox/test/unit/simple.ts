/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { ElementHandle, JSHandle, Page } from 'playwright';

import test from 'tests/config/unit/test';

import Component from 'tests/helpers/component';

import type bCheckbox from 'form/b-checkbox/b-checkbox';

test.describe('b-checkbox simple usage', () => {
	const
		q = '[data-id="target"]';

	test.beforeEach(async ({demoPage}) => {
		await demoPage.goto();
	});

	test('providing of attributes', async ({page}) => {
		await init(page, {id: 'foo', name: 'bla'});

		const
			input = <ElementHandle<HTMLInputElement>>(await page.waitForSelector('#foo', {state: 'attached'}));

		test.expect(
			await input.evaluate((ctx) => [
				ctx.tagName,
				ctx.type,
				ctx.name,
				ctx.checked
			])

		).toEqual(['INPUT', 'checkbox', 'bla', false]);
	});

	test('checked checkbox', async ({page}) => {
		const target = await init(page, {checked: true, value: 'bar'});

		test.expect(
			await target.evaluate((ctx) => ctx.value)
		).toBe('bar');
	});

	test('non-changeable checkbox', async ({page}) => {
		const target = await init(page, {changeable: false});

		test.expect(
			await target.evaluate((ctx) => ctx.value)
		).toBeUndefined();

		await page.click(q);

		test.expect(
			await target.evaluate((ctx) => ctx.value)
		).toBe(true);

		await page.click(q);

		test.expect(
			await target.evaluate((ctx) => ctx.value)
		).toBe(true);

		test.expect(
			await target.evaluate((ctx) => ctx.uncheck())
		).toBe(true);

		test.expect(
			await target.evaluate((ctx) => ctx.value)
		).toBeUndefined();
	});

	test('checking a non-defined value (user actions)', async ({page}) => {
		const target = await init(page);

		test.expect(
			await target.evaluate((ctx) => ctx.value)
		).toBeUndefined();

		await page.click(q);

		test.expect(
			await target.evaluate((ctx) => ctx.value)
		).toBe(true);

		await page.click(q);

		test.expect(
			await target.evaluate((ctx) => ctx.value)
		).toBeUndefined();
	});

	test('checking a predefined value (user actions)', async ({page}) => {
		const target = await init(page, {value: 'bar'});

		test.expect(
			await target.evaluate((ctx) => ctx.value)
		).toBeUndefined();

		await page.click(q);

		test.expect(
			await target.evaluate((ctx) => ctx.value)
		).toBe('bar');

		await page.click(q);

		test.expect(
			await target.evaluate((ctx) => ctx.value)
		).toBeUndefined();
	});

	test('checking a non-defined value (API)', async ({page}) => {
		const target = await init(page);

		test.expect(
			await target.evaluate((ctx) => ctx.value)
		).toBeUndefined();

		test.expect(
			await target.evaluate((ctx) => ctx.check())
		).toBe(true);

		test.expect(
			await target.evaluate((ctx) => ctx.value)
		).toBe(true);

		test.expect(
			await target.evaluate((ctx) => ctx.uncheck())
		).toBe(true);

		test.expect(
			await target.evaluate((ctx) => ctx.value)
		).toBeUndefined();

		test.expect(
			await target.evaluate((ctx) => ctx.toggle())
		).toBe(true);

		test.expect(
			await target.evaluate((ctx) => ctx.toggle())
		).toBeUndefined();
	});

	test('checking a predefined value (API)', async ({page}) => {
		const target = await init(page, {value: 'bar'});

		test.expect(
			await target.evaluate((ctx) => ctx.value)
		).toBeUndefined();

		test.expect(
			await target.evaluate((ctx) => ctx.check())
		).toBe(true);

		test.expect(
			await target.evaluate((ctx) => ctx.value)
		).toBe('bar');

		test.expect(
			await target.evaluate((ctx) => ctx.uncheck())
		).toBe(true);

		test.expect(
			await target.evaluate((ctx) => ctx.value)
		).toBeUndefined();

		test.expect(
			await target.evaluate((ctx) => ctx.toggle())
		).toBe('bar');

		test.expect(
			await target.evaluate((ctx) => ctx.toggle())
		).toBeUndefined();
	});

	test('checking with id prop', async ({page}) => {
		const target = await init(page, {value: 'bar', id: 'foo'});

		test.expect(
			await target.evaluate((ctx) => ctx.unsafe.block!.element('hidden-input')?.id)
		).toBe('foo');
	});

	test('checking without id prop', async ({page}) => {
		const target = await init(page, {value: 'bar'});
		const id = await target.evaluate((ctx) => ctx.unsafe.dom.getId(''));

		test.expect(
			await target.evaluate((ctx) => ctx.unsafe.block!.element('hidden-input')?.id)
		).toBe(`${id}hidden-input`);
	});

	test('checkbox with a `label` prop', async ({page}) => {
		const target = await init(page, {
			label: 'Foo'
		});

		test.expect(
			await target.evaluate((ctx) => ctx.unsafe.block!.element('label')?.textContent?.trim())
		).toEqual('Foo');

		const selector = await target.evaluate(
			(ctx) => `.${ctx.unsafe.block!.element('label')?.className.split(' ').join('.')}`
		);

		await page.click(selector);

		test.expect(
			await target.evaluate((ctx) => ctx.value)
		).toBe(true);

		const id = await target.evaluate((ctx) => ctx.unsafe.dom.getId(''));

		test.expect(
			await target.evaluate((ctx) => ctx.unsafe.block!.element('label')?.getAttribute('for'))
		).toBe(`${id}hidden-input`);

		const target2 = await init(page, {
			label: 'Foo',
			id: 'bla'
		});

		test.expect(
			await target2.evaluate((ctx) => ctx.unsafe.block!.element('label')?.getAttribute('for'))
		).toBe('bla');
	});

	/**
	 * @param page
	 * @param attrs
	 */
	async function init(page: Page, attrs: Dictionary = {}): Promise<JSHandle<bCheckbox>> {
		return Component.createComponent(page, 'b-checkbox', {
			attrs: {
				'data-id': 'target',
				...attrs
			}
		});
	}
});
