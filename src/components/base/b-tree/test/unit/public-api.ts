/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import test from 'tests/config/unit/test';

import { renderTree, waitForItemWithValue, createExpectMod } from 'components/base/b-tree/test/helpers';

test.describe('<b-tree> public API', () => {
	const items = [
		{value: 1},
		{value: 2},

		{
			value: 3,
			folded: true,

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

	test.describe('traverse', () => {
		test('should return an iterator over all rendered tree items', async ({page}) => {
			const tree = await renderTree(page, {items});

			const values = await tree.evaluate(
				(ctx) => [...ctx.traverse(ctx)].map(([item]) => item.value)
			);

			test.expect(values).toEqual([1, 2, 3, 5]);
		});

		test('if it is fully rendered at once, it should return an iterator over all tree items', async ({page}) => {
			const tree = await renderTree(page, {
				items,
				attrs: {
					lazyRender: false
				}
			});

			const values = await tree.evaluate(
				(ctx) => [...ctx.traverse(ctx)].map(([item]) => item.value)
			);

			test.expect(values).toEqual([1, 2, 3, 5, 4, 6]);
		});

		test(
			'the flag `deep: false` means that the iterator should only traverse top-level items',

			async ({page}) => {
				const tree = await renderTree(page, {
					items,
					attrs: {
						lazyRender: false
					}
				});

				const values = await tree.evaluate(
					(ctx) => [...ctx.traverse(ctx, {deep: false})].map(([item]) => item.value)
				);

				test.expect(values).toEqual([1, 2, 3, 5]);
			}
		);
	});

	test('`fold/unfold`', async ({page}) => {
		const tree = await renderTree(page, {
			items,
			attrs: {
				lazyRender: false
			}
		});

		const expectFolded = createExpectMod('folded');

		await tree.evaluate(async (ctx) => ctx.unfold());

		await expectFolded(false, [await waitForItemWithValue(page, tree, 3)]);

		await tree.evaluate(async (ctx) => ctx.fold());

		await expectFolded(true, [
			await waitForItemWithValue(page, tree, 3),
			await waitForItemWithValue(page, tree, 4)
		]);

		await tree.evaluate((ctx) => ctx.unfold(ctx.items[2].value));

		await expectFolded(false, [await waitForItemWithValue(page, tree, 3)]);
	});
});
