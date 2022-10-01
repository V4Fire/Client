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

test.describe('v-aria:tabpanel', () => {
	test.beforeEach(async ({demoPage}) => {
		await demoPage.goto();
	});

	test('tabpanel must have the `role` attribute', async ({page}) => {
		const target = await init(page, {label: 'foo'});

		test.expect(
			await target.evaluate((ctx) => ctx.$el?.getAttribute('role'))
		).toBe('tabpanel');
	});

	test('tabpanel must have the `label` or `labelledby` params to be passed', async ({page}) => {
		const target = await init(page);

		test.expect(
			await target.evaluate((ctx) => ctx.$el?.getAttribute('role'))
		).toBe(null);
	});

	/**
	 * @param page
	 * @param attrs
	 */
	async function init(page: Page, attrs: Dictionary = {}): Promise<JSHandle<iBlock>> {
		return Component.createComponent(page, 'b-dummy', {
			attrs: {
				'v-aria:tabpanel': {
					...attrs
				}
			}
		});
	}
});
