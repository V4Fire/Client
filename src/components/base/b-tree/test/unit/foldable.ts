/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import test from 'tests/config/unit/test';

import type { Item } from 'components/base/b-tree/interface';

import { renderTree, createTreeSelector, createTestModIs, waitForItems } from 'components/base/b-tree/test/helpers';

test.describe('<b-tree> foldable', () => {
	const
		testFoldedModIs = createTestModIs('folded'),
		foldSelector = createTreeSelector('fold');

	const items: Item[] = [
		{
			label: 'root',
			value: '0',
			folded: false,
			children: [
				{
					label: 'item 1',
					value: '1',
					children: [{label: 'item 1.1', value: '1.1'}]
				},

				{
					label: 'item 2',
					value: '2',
					children: [{label: 'item 2.1', value: '2.1'}]
				}
			]
		}
	];

	test.beforeEach(async ({demoPage}) => {
		await demoPage.goto();
	});

	test.describe('with `folded = false`', () => {
		const attrs = {folded: false};

		test("should fold the children of the item when it's `fold` element is clicked", async ({page}) => {
			const target = await renderTree(page, {items, attrs});
			await page.getByText('item 1').locator(foldSelector).click();

			await testFoldedModIs(true, await waitForItems(page, target, ['1']));
			await testFoldedModIs(false, await waitForItems(page, target, ['2']));
		});
	});

	test.describe('with `folded = true`', () => {
		const attrs = {folded: true};

		test("should unfold the children of the item when it's `fold` element is clicked", async ({page}) => {
			const target = await renderTree(page, {items, attrs});
			await page.getByText('item 1').locator(foldSelector).click();

			await testFoldedModIs(false, await waitForItems(page, target, ['1']));
			await testFoldedModIs(true, await waitForItems(page, target, ['2']));
		});
	});
});
