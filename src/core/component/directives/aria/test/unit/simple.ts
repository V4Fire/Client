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

test.describe('v-aria', () => {
	test.beforeEach(async ({demoPage}) => {
		await demoPage.goto();
	});

	test('aria-label is added', async ({page}) => {
		const target = await init(page, {'v-aria': {label: 'bla'}});

		test.expect(
			await target.evaluate((ctx) => ctx.$el?.getAttribute('aria-label'))
		).toBe('bla');
	});

	test('aria-labelledby is added', async ({page}) => {
		const target = await init(page, {'v-aria': {labelledby: 'bla'}});

		test.expect(
			await target.evaluate((ctx) => ctx.$el?.getAttribute('aria-labelledby'))
		).toBe('bla');
	});

	test('aria-description is added', async ({page}) => {
		const target = await init(page, {'v-aria': {description: 'bla'}});

		test.expect(
			await target.evaluate((ctx) => ctx.$el?.getAttribute('aria-description'))
		).toBe('bla');
	});

	test('aria-describedby is added', async ({page}) => {
		const target = await init(page, {'v-aria': {describedby: 'bla'}});

		test.expect(
			await target.evaluate((ctx) => ctx.$el?.getAttribute('aria-describedby'))
		).toBe('bla');
	});

	test('aria-labelledby sugar syntax', async ({page}) => {
		const target = await init(page, {'v-aria.#bla': {}});

		const id = await target.evaluate((ctx) => ctx.$root.unsafe.dom.getId('bla'));

		test.expect(
			await target.evaluate((ctx) => ctx.$el?.getAttribute('aria-labelledby'))
		).toBe(id);
	});

	/**
	 * @param page
	 * @param attrs
	 */
	async function init(page: Page, attrs: Dictionary = {}): Promise<JSHandle<iBlock>> {
		return Component.createComponent(page, 'b-dummy', {
			attrs
		});
	}
});
