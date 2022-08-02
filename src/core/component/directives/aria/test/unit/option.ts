// @ts-check

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

test.describe('v-aria:option', () => {
	test.beforeEach(async ({demoPage}) => {
		await demoPage.goto();
	});

	const
		selector = '[data-id="target"]';

	test('role is set', async ({page}) => {
		const target = await init(page);

		await page.click(selector);

		test.expect(
			await target.evaluate((ctx) => {
				if (ctx.unsafe.block == null) {
					return;
				}

				const [el1, el2]: HTMLElement[] = Array.from(ctx.unsafe.block.elements('item'));

				return [el1.getAttribute('role'), el2.getAttribute('role')];
			})
		).toEqual(['option', 'option']);
	});

	test('has no preselected value', async ({page}) => {
		const target = await init(page);

		await page.click(selector);

		test.expect(
			await target.evaluate((ctx) => {
				if (ctx.unsafe.block == null) {
					return;
				}

				const [el1, el2]: HTMLElement[] = Array.from(ctx.unsafe.block.elements('item'));

				return [el1.getAttribute('aria-selected'), el2.getAttribute('aria-selected')];
			})
		).toEqual(['false', 'false']);
	});

	test('options with preselected value', async ({page}) => {
		const target = await init(page, {value: 0});

		await page.click(selector);

		test.expect(
			await target.evaluate((ctx) => {
				if (ctx.unsafe.block == null) {
					return;
				}

				const [el1, el2]: HTMLElement[] = Array.from(ctx.unsafe.block.elements('item'));

				return [el1.getAttribute('aria-selected'), el2.getAttribute('aria-selected')];
			})
		).toEqual(['true', 'false']);
	});

	test('selected option changed', async ({page}) => {
		const target = await init(page, {value: 0});

		await page.click(selector);

		test.expect(
			await target.evaluate((ctx) => {
				if (ctx.unsafe.block == null) {
					return;
				}

				const input = ctx.unsafe.block.element('input');
				const [el1, el2]: HTMLElement[] = Array.from(ctx.unsafe.block.elements('item'));

				input?.dispatchEvent(new KeyboardEvent('keydown', {key: 'ArrowDown', bubbles: true}));

				input?.dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter', bubbles: true}));

				return [el1.getAttribute('aria-selected'), el2.getAttribute('aria-selected')];
			})
		).toEqual(['false', 'true']);
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
					{label: 'foo', value: 0, attrs: {id: 'item1'}},
					{label: 'bar', value: 1, attrs: {id: 'item2'}}
				],
				...attrs
			}
		});
	}
});
