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

	test('one aria attribute is added', async ({page}) => {
		const target = await init(page, {'v-aria': {label: 'bla'}});

		test.expect(
			await target.evaluate((ctx) => ctx.$el?.getAttribute('aria-label'))
		).toBe('bla');
	});

	test('two aria attributes are added', async ({page}) => {
		const target = await init(page, {'v-aria': {describedby: 'bla', label: 'foo'}});

		test.expect(
			await target.evaluate((ctx) => ctx.$el?.getAttribute('aria-describedby'))
		).toBe('bla');

		test.expect(
			await target.evaluate((ctx) => ctx.$el?.getAttribute('aria-label'))
		).toBe('foo');
	});

	test('aria-labelledby is added by string', async ({page}) => {
		const target = await init(page, {'v-aria': {labelledby: 'bla'}});

		test.expect(
			await target.evaluate((ctx) => ctx.$el?.getAttribute('aria-labelledby'))
		).toBe('bla');
	});

	test('aria-labelledby is added by array', async ({page}) => {
		const target = await init(page, {'v-aria': {labelledby: ['bla', 'bar', 'foo']}});

		test.expect(
			await target.evaluate((ctx) => ctx.$el?.getAttribute('aria-labelledby'))
		).toBe('bla bar foo');
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
