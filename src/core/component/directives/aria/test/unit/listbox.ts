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

test.describe('v-aria:listbox', () => {
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
				const el = ctx.unsafe.block?.element('dropdown');

				return el?.getAttribute('role');
			})
		).toBe('listbox');
	});

	test('tabindex is -1', async ({page}) => {
		const target = await init(page);

		await page.click(selector);

		test.expect(
			await target.evaluate((ctx) => {
				const el = ctx.unsafe.block?.element('dropdown');

				return el?.getAttribute('tabindex');
			})
		).toBe('-1');
	});

	/**
	 * @param page
	 */
	async function init(page: Page): Promise<JSHandle<iBlock>> {
		return Component.createComponent(page, 'b-select', {
			attrs: {
				'data-id': 'target',
				items: [
					{label: 'foo', value: 0},
					{label: 'bar', value: 1}
				]
			}
		});
	}
});
