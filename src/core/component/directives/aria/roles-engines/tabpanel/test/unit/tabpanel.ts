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

test.describe('v-aria:tabpanel', () => {
	test.beforeEach(async ({demoPage}) => {
		await demoPage.goto();
	});

	test('role is set', async ({page}) => {
		const target = await init(page, {});

		test.expect(
			await target.evaluate((ctx) => ctx.$el?.getAttribute('role'))
		).toBe('tabpanel');
	});

	test('no label passed', async ({page}) => {
		const target = await init(page, {'v-aria:tabpanel': {}});

		test.expect(
			await target.evaluate((ctx) => ctx.$el?.hasAttribute('role'))
		).toBe(false);
	});

	/**
	 * @param page
	 * @param attrs
	 */
	async function init(page: Page, attrs: Dictionary = {}): Promise<JSHandle<iBlock>> {
		return Component.createComponent(page, 'b-dummy', {
			attrs: {
				'v-aria:tabpanel': {label: 'foo'},
				...attrs
			}
		});
	}
});
