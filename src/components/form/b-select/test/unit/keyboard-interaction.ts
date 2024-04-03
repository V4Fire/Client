/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import test from 'tests/config/unit/test';

import { Assert, ComponentObject } from 'tests/helpers';

import { createSelector, renderSelect } from 'components/form/b-select/test/helpers';

import type bDummy from 'components/dummies/b-dummy/b-dummy';
import type { ComponentElement } from 'components/dummies/b-dummy/b-dummy';

test.describe('<b-select> keyboard interaction', () => {
	const items = [
		{label: 'Foo', value: 0},
		{label: 'Bar', value: 1},
		{label: 'Baz', value: 2}
	];

	test.beforeEach(async ({demoPage, page}) => {
		await demoPage.goto();
		Assert.setPage(page);
	});

	test.afterEach(() => {
		Assert.unsetPage();
	});

	test('should navigate items using up/down arrows', async ({page}) => {
		await renderSelect(page, {items});

		const
			assertItemsMarkedModIs = Assert.component.itemsHaveMod('marked'),
			assertItemsDoNotHaveMarkedClass = Assert.component.not.itemsHaveClass(/marked_true/);

		await page.locator(createSelector('input')).focus();

		await page.keyboard.press('ArrowDown');
		await assertItemsDoNotHaveMarkedClass([1, 2]);
		await assertItemsMarkedModIs(true, 0);

		await page.keyboard.press('ArrowDown');
		await assertItemsDoNotHaveMarkedClass([0, 2]);
		await assertItemsMarkedModIs(true, 1);

		await page.keyboard.press('ArrowDown');
		await assertItemsDoNotHaveMarkedClass([0, 1]);
		await assertItemsMarkedModIs(true, 2);

		await page.keyboard.press('ArrowUp');
		await assertItemsDoNotHaveMarkedClass([0, 2]);
		await assertItemsMarkedModIs(true, 1);

		await page.keyboard.press('ArrowUp');
		await assertItemsDoNotHaveMarkedClass([1, 2]);
		await assertItemsMarkedModIs(true, 0);
	});

	test('should close dropdown when `ArrowUp` is pressed', async ({page}) => {
		await renderSelect(page, {items});

		const dropdown = page.locator(createSelector('dropdown'));

		await page.locator(createSelector('input')).focus();

		await test.expect(dropdown).toBeVisible();

		await page.keyboard.press('ArrowUp');

		await test.expect(dropdown).toBeHidden();
	});

	test('should close dropdown when `Tab` is pressed', async ({page}) => {
		await renderSelect(page, {items});

		const dropdown = page.locator(createSelector('dropdown'));

		await page.locator(createSelector('input')).focus();

		await test.expect(dropdown).toBeVisible();

		await page.keyboard.press('Tab');

		await test.expect(dropdown).toBeHidden();
	});

	test('should loop through items using `ArrowDown`', async ({page}) => {
		await renderSelect(page, {items});

		const assertItemsMarkedModIs = Assert.component.itemsHaveMod('marked');

		await page.locator(createSelector('input')).focus();

		await page.keyboard.press('ArrowDown');
		await assertItemsMarkedModIs(true, 0);

		await page.keyboard.press('ArrowDown');
		await assertItemsMarkedModIs(true, 1);

		await page.keyboard.press('ArrowDown');
		await assertItemsMarkedModIs(true, 2);

		await page.keyboard.press('ArrowDown');
		await assertItemsMarkedModIs(true, 0);
	});

	test('should select item when `Enter` is pressed', async ({page}) => {
		const
			target = await renderSelect(page, {items}),
			dropdown = page.locator(createSelector('dropdown'));

		await page.locator(createSelector('input')).focus();

		await page.keyboard.press('ArrowDown');
		await page.keyboard.press('Enter');

		await test.expect(target.evaluate((ctx) => ctx.value)).resolves.toEqual(0);
		await test.expect(dropdown).toBeHidden();

		await page.keyboard.press('ArrowDown');
		await page.keyboard.press('ArrowDown');
		await page.keyboard.press('Enter');

		await test.expect(target.evaluate((ctx) => ctx.value)).resolves.toEqual(1);
		await test.expect(dropdown).toBeHidden();
	});

	test([
		'should focus on the input when the user starts typing,',
		'given that the input has no focus and the dropdown is open'
	].join(' '), async ({page}) => {
		await renderSelect(page, {items});

		const
			input = page.locator(createSelector('input')),
			dropdown = page.locator(createSelector('dropdown'));

		await input.focus();
		await test.expect(input).toBeFocused();

		await input.blur();
		await test.expect(dropdown).toBeVisible();
		await test.expect(input).not.toBeFocused();

		await page.keyboard.type('Baz');
		await test.expect(input).toBeFocused();
		await test.expect(input).toHaveValue('Baz');
	});

	test([
		'should not focus on the input when the user starts typing,',
		'given that the input has no focus and the dropdown is closed'
	].join(' '), async ({page}) => {
		await renderSelect(page, {items});

		const
			input = page.locator(createSelector('input')),
			dropdown = page.locator(createSelector('dropdown'));

		await input.focus();
		await test.expect(input).toBeFocused();

		await page.keyboard.press('ArrowDown');
		await page.keyboard.press('Enter');

		await test.expect(input).toHaveValue('Foo');
		await test.expect(dropdown).toBeHidden();

		await page.keyboard.press('Tab');
		await test.expect(input).not.toBeFocused();

		await page.keyboard.type('Baz');
		await test.expect(input).not.toBeFocused();
		await test.expect(input).toHaveValue('Foo');
	});

	test('should restore the keydown event handler after the functional component is recreated', async ({page}) => {
		const builder = new ComponentObject(page, 'b-select');

		const props = {
			items,
			'@onChange': (value: string) => {
				const {component} = (<ComponentElement<bDummy>>document.querySelector('.b-dummy'));
				component!.testComponentAttrs.value = value;
			}
		};

		const
			select = await builder.withProps(props).build({functional: true, useDummy: true}),
			componentInstance = await select.evaluateHandle((ctx) => ctx.$el!.component!);

		const
			input = page.locator(createSelector('input')),
			dropdown = page.locator(createSelector('dropdown'));

		await input.focus();
		await test.expect(input).toBeFocused();

		await page.keyboard.press('ArrowDown');
		await page.keyboard.press('Enter');

		const instanceIsRecreated = await select.evaluate(
			(current, previous) => current.$el!.component !== previous,
			componentInstance
		);

		test.expect(instanceIsRecreated).toBeTruthy();

		await test.expect(input).toHaveValue('Foo');
		await test.expect(dropdown).toBeHidden();

		await page.keyboard.press('ArrowDown');
		await test.expect(dropdown).toBeVisible();

		await page.keyboard.press('ArrowDown');
		await page.keyboard.press('Enter');

		await test.expect(input).toHaveValue('Bar');
	});
});
