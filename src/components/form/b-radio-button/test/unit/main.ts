/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { ElementHandle, JSHandle, Page } from 'playwright';

import type * as Block from 'components/friends/block';
import type bRadioButton from 'components/form/b-radio-button/b-radio-button';

import test from 'tests/config/unit/test';
import Component from 'tests/helpers/component';
import Utils from 'tests/helpers/utils';

test.describe('<b-radio-button>', () => {
	const
		q = '[data-id="target"]';

	test.beforeEach(async ({page, demoPage}) => {
		await demoPage.goto();

		const BlockAPI = await Utils.import<typeof Block>(page, 'components/friends/block');
		await BlockAPI.evaluate((ctx) => ctx.default.addToPrototype(ctx));
	});

	test('the component markup should have a <input type="radio"/> tag with the provided attributes', async ({page}) => {
		await renderRadioButton(page, {id: 'foo', name: 'bla'});

		const
			input = <ElementHandle<HTMLInputElement>>(await page.waitForSelector('#foo', {state: 'attached'}));

		test.expect(
			await input.evaluate((ctx) => [
				ctx.tagName,
				ctx.type,
				ctx.name,
				ctx.checked
			])

		).toEqual(['INPUT', 'radio', 'bla', false]);
	});

	test('if the radio button is checked by default, then it has a value equal to the one passed in the prop or true', async ({page}) => {
		const target = await renderRadioButton(page, {checked: true, value: 'bar'});

		test.expect(
			await target.evaluate((ctx) => ctx.value)
		).toBe('bar');
	});

	test("the component shouldn't change its value on click", async ({page}) => {
		const target = await renderRadioButton(page);

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

	test('if the component has the `value` prop, then when it is checked, it will have a value equal to the value passed to the prop - otherwise undefined', async ({page}) => {
		const target = await renderRadioButton(page, {value: 'bar'});

		test.expect(
			await target.evaluate((ctx) => ctx.value)
		).toBeUndefined();

		await page.click(q);

		test.expect(
			await target.evaluate((ctx) => ctx.value)
		).toBe('bar');
	});

	test('clicking on the radio button label should also toggle the component value', async ({page}) => {
		const target = await renderRadioButton(page, {
			label: 'Foo'
		});

		test.expect(
			await target.evaluate(({unsafe}) => unsafe.block!.element('label')?.textContent?.trim())
		).toEqual('Foo');

		const selector = await target.evaluate(
			({unsafe}) => `.${unsafe.block!.element('label')?.className.split(' ').join('.')}`
		);

		await page.click(selector);

		test.expect(
			await target.evaluate((ctx) => ctx.value)
		).toBe(true);
	});

	test.describe('the component should change its value when calling special methods', () => {
		test('if the component does not have the `value` prop, then when it is checked, it will have a value equal to true - otherwise undefined', async ({page}) => {
			const target = await renderRadioButton(page);

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

		test('if the component has the `value` prop, then when it is checked, it will have a value equal to the value passed to the prop - otherwise undefined', async ({page}) => {
			const target = await renderRadioButton(page, {value: 'bar'});

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
	});

	/**
	 * @param page
	 * @param attrs
	 */
	async function renderRadioButton(page: Page, attrs: RenderComponentsVnodeParams['attrs'] = {}): Promise<JSHandle<bRadioButton>> {
		return Component.createComponent(page, 'b-radio-button', {
			attrs: {
				'data-id': 'target',
				...attrs
			}
		});
	}
});
