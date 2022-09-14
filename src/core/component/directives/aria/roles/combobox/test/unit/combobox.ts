/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { JSHandle, Page } from 'playwright';
import type iBlock from 'super/i-block/i-block';

import test from 'tests/config/unit/test';
import Component from 'tests/helpers/component';

test.describe('v-aria:combobox', () => {
	test.beforeEach(async ({demoPage}) => {
		await demoPage.goto();
	});

	const
		selector = '[data-id="target"]';

	/**
	 * Initial attributes
	 */
	test('role is set', async ({page}) => {
		const target = await init(page);

		test.expect(
			await target.evaluate((ctx) => ctx.unsafe.block?.element('input')?.getAttribute('role'))
		).toBe('combobox');
	});

	test('aria-expanded is set to false', async ({page}) => {
		const target = await init(page);

		test.expect(
			await target.evaluate((ctx) => ctx.unsafe.block?.element('input')?.getAttribute('aria-expanded'))
		).toBe('false');
	});

	test('aria-multiselectable is set', async ({page}) => {
		const target = await init(page, {multiple: true});

		test.expect(
			await target.evaluate((ctx) => ctx.unsafe.block?.element('input')?.getAttribute('aria-multiselectable'))
		).toBe('true');
	});

	test('element\'s tabindex is 0', async ({page}) => {
		const target = await init(page);

		test.expect(
			await target.evaluate((ctx) => {
				const input = <HTMLElement>ctx.unsafe.block?.element('input');
				return input.tabIndex;
			})
		).toBe(0);
	});

	/**
	 * Handling events
	 */
	test('select is opened with no preselected option', async ({page}) => {
		const target = await init(page);

		await page.click(selector);

		test.expect(
			await target.evaluate((ctx) => ctx.unsafe.block?.element('input')?.getAttribute('aria-expanded'))
		).toBe('true');

		test.expect(
			await target.evaluate((ctx) => ctx.unsafe.block?.element('input')?.getAttribute('aria-activedescendant'))
		).toBe('');
	});

	test('select is opened with preselected option', async ({page}) => {
		const target = await init(page, {value: 1});

		await page.focus('input');

		const id = await target.evaluate((ctx) => ctx.unsafe.dom.getId('1'));

		test.expect(
			await target.evaluate((ctx) => ctx.unsafe.block?.element('input')?.getAttribute('aria-expanded'))
		).toBe('true');

		test.expect(
			await target.evaluate((ctx) => ctx.unsafe.block?.element('input')?.getAttribute('aria-activedescendant'))
		).toBe(id);
	});

	test('select is opened and closed', async ({page}) => {
		const target = await init(page, {value: 1});

		await page.focus('input');

		test.expect(
			await target.evaluate((ctx) => ctx.unsafe.block?.element('input')?.getAttribute('aria-expanded'))
		).toBe('true');

		await page.click('body');

		test.expect(
			await target.evaluate((ctx) => ctx.unsafe.block?.element('input')?.getAttribute('aria-expanded'))
		).toBe('false');

		test.expect(
			await target.evaluate((ctx) => ctx.unsafe.block?.element('input')?.getAttribute('aria-activedescendant'))
		).toBe('');
	});

	/**
	 * @param page
	 * @param attrs
	 */
	async function init(page: Page, attrs: Dictionary = {}): Promise<JSHandle<iBlock>> {
		return Component.createComponent(page, 'b-select', {
			attrs: {
				'data-id': 'target',
				items: [
					{label: 'foo', value: 0},
					{label: 'bar', value: 1}
				],
				...attrs
			}
		});
	}
});
