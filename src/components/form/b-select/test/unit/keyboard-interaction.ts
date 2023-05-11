/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import test from 'tests/config/unit/test';

import { Assert } from 'tests/helpers';

import { createSelector, renderSelect } from 'components/form/b-select/test/helpers';

// eslint-disable-next-line max-lines-per-function
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

		await page.locator(createSelector('input')).focus();

		await test.expect(page.locator(createSelector('dropdown')).isVisible()).resolves.toBeTruthy();

		await page.keyboard.press('ArrowUp');

		await test.expect(page.locator(createSelector('dropdown')).isVisible()).resolves.toBeFalsy();
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
		const target = await renderSelect(page, {items});

		await page.locator(createSelector('input')).focus();

		await page.keyboard.press('ArrowDown');
		await page.keyboard.press('Enter');

		await test.expect(target.evaluate((ctx) => ctx.value)).resolves.toEqual(0);
		await test.expect(page.locator(createSelector('dropdown')).isVisible()).resolves.toBeFalsy();

		await page.keyboard.press('ArrowDown');
		await page.keyboard.press('ArrowDown');
		await page.keyboard.press('Enter');

		await test.expect(target.evaluate((ctx) => ctx.value)).resolves.toEqual(1);
		await test.expect(page.locator(createSelector('dropdown')).isVisible()).resolves.toBeFalsy();
	});
});
