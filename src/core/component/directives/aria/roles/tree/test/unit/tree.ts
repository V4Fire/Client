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

	test('role is set', async ({page}) => {
		const target = await init(page);

		await page.waitForSelector('[role="group"]');

		test.expect(
			await target.evaluate(() => {
				const
					roots = document.querySelectorAll('[role="tree"]'),
					groups = document.querySelectorAll('[role="group"]');

				return [roots.length, groups.length];
			})
		).toEqual([1, 2]);
	});

	test('orientation is set', async ({page}) => {
		const target = await init(page, {orientation: 'horizontal'});

		test.expect(
			await target.evaluate((ctx) => {
				const el = ctx.unsafe.block?.element('root');

				return el?.getAttribute('aria-orientation');
			})
		).toBe('horizontal');
	});

	test('treeitem is expanded', async ({page}) => {
		const target = await init(page);

		test.expect(
			await target.evaluate((ctx) => {
				const
					fold: CanUndef<HTMLElement> = ctx.unsafe.block?.element('fold'),
					items = ctx.unsafe.block?.elements('node'),
					expandableItem = items?.[1];

				const
					res: Array<CanUndef<Nullable<string>>> = [];

				fold?.click();
				res.push(expandableItem?.getAttribute('aria-expanded'));

				fold?.click();
				res.push(expandableItem?.getAttribute('aria-expanded'));

				return res;
			})
		).toEqual(['true', 'false']);
	});

	/**
	 * @param page
	 * @param attrs
	 */
	async function init(page: Page, attrs: Dictionary = {}): Promise<JSHandle<iBlock>> {
		return Component.createComponent(page, 'b-tree', {
			attrs: {
				item: 'b-checkbox',
				items: [
					{id: 'bar', label: 'bar', attrs: {id: 'bar'}},
					{
						id: 'foo',
						label: 'foo',
						children: [
							{id: 'fooone', label: 'foo1'},
							{id: 'footwo', label: 'foo2'},
							{
								id: 'foothree',
								label: 'foo3',
								children: [{id: 'foothreeone', label: 'foo4'}]
							},
							{id: 'foosix', label: 'foo5'}
						]
					}
				],
				...attrs
			}
		});
	}
});

