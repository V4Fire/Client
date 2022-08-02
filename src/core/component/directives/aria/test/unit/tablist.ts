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

test.describe('v-aria:tablist', () => {
	test.beforeEach(async ({demoPage}) => {
		await demoPage.goto();
	});

	test('role is set', async ({page}) => {
		const target = await init(page);

		test.expect(
			await target.evaluate((ctx) => {
				const el = ctx.unsafe.block?.element('wrapper');

				return el?.getAttribute('role');
			})
		).toBe('tablist');
	});

	test('multiselectable is set', async ({page}) => {
		const target = await init(page, {multiple: true});

		test.expect(
			await target.evaluate((ctx) => {
				const el = ctx.unsafe.block?.element('wrapper');

				return el?.getAttribute('aria-multiselectable');
			})
		).toBe('true');
	});

	test('orientation is set', async ({page}) => {
		const target = await init(page, {orientation: 'vertical'});

		test.expect(
			await target.evaluate((ctx) => {
				const el = ctx.unsafe.block?.element('wrapper');

				return el?.getAttribute('aria-orientation');
			})
		).toBe('vertical');
	});

	/**
	 * @param page
	 * @param attrs
	 */
	async function init(page: Page, attrs: Dictionary = {}): Promise<JSHandle<iBlock>> {
		return Component.createComponent(page, 'b-list', {
			attrs: {
				items: [
					{label: 'foo', value: 0},
					{label: 'bar', value: 1}
				],
				...attrs
			}
		});
	}
});
