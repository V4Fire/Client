// @ts-check

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */
import type { JSHandle, Page } from 'playwright';
import type bDummy from 'dummies/b-dummy/b-dummy';

import test from 'tests/config/unit/test';
import Component from 'tests/helpers/component';

test.describe('v-id', () => {
	test.beforeEach(async ({demoPage}) => {
		await demoPage.goto();
	});

	test('id is added', async ({page}) => {
		const target = await init(page);
		const id = await target.evaluate((ctx) => ctx.$root.unsafe.dom.getId('dummy'));

		test.expect(
			await target.evaluate((ctx) => ctx.$el?.id)
		).toBe(id);
	});

	test('preserve mod', async ({page}) => {
		const target = await init(page, {'v-id.preserve': 'dummy', id: 'foo'});

		test.expect(
			await target.evaluate((ctx) => ctx.$el?.id)
		).toBe('foo');
	});

	/**
	 * @param page
	 * @param attrs
	 */
	async function init(page: Page, attrs: Dictionary = {}): Promise<JSHandle<bDummy>> {
		return Component.createComponent(page, 'b-dummy', {
			attrs: {'v-id': 'dummy', ...attrs}
		});
	}
});
