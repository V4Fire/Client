/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import test from 'tests/config/unit/test';

import { renderTree, waitForItem, createTestModIs } from 'components/base/b-tree/test/helpers';

test.describe('<b-tree> public API', () => {
	const testFoldedModIs = createTestModIs('folded');

	const items = [
		{value: 1},
		{value: 2},

		{
			value: 3,
			children: [
				{
					value: 4,
					children: [{value: 6}]
				}
			]
		},

		{value: 5}
	];

	test.beforeEach(async ({demoPage}) => {
		await demoPage.goto();
	});

	test('traverse', async ({page}) => {
		const target = await renderTree(page, {items});

		let res = await target.evaluate((ctx) => [...ctx.traverse()].map(([item]) => item.value));
		test.expect(res).toEqual([1, 2, 3, 5, 4, 6]);

		res = await target.evaluate((ctx) => [...ctx.traverse(ctx, {deep: false})].map(([item]) => item.value));
		test.expect(res).toEqual([1, 2, 3, 5]);
	});

	test('fold/unfold', async ({page}) => {
		const target = await renderTree(page, {items});

		await target.evaluate(async (ctx) => ctx.unfold());

		await testFoldedModIs(false, [await waitForItem(page, target, 3)]);

		await target.evaluate(async (ctx) => ctx.fold());

		await testFoldedModIs(true, [
			await waitForItem(page, target, 3),
			await waitForItem(page, target, 4)
		]);

		await target.evaluate((ctx) => ctx.unfold(ctx.items[2].value));

		await testFoldedModIs(false, [await waitForItem(page, target, 3)]);
	});
});
