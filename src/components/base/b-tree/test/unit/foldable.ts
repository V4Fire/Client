/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import test from 'tests/config/unit/test';

import type bTree from 'components/base/b-tree/b-tree';
import type { Item } from 'components/base/b-tree/b-tree';

import {

	renderTree,

	createExpectMod,
	createTreeSelector,

	waitForItemWithValue,
	waitForItemsWithValues

} from 'components/base/b-tree/test/helpers';

test.describe('<b-tree> foldable API', () => {
	const
		expectFolded = createExpectMod('folded'),
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
			const tree = await renderTree(page, {items, attrs});
			await page.getByText('item 1').locator(foldSelector).click();

			await expectFolded(true, await waitForItemsWithValues(page, tree, ['1']));
			await expectFolded(false, await waitForItemsWithValues(page, tree, ['2']));
		});
	});

	test.describe('with `folded = true`', () => {
		const attrs = {folded: true};

		test("should unfold the children of the item when it's `fold` element is clicked", async ({page}) => {
			const tree = await renderTree(page, {items, attrs});
			await page.getByText('item 1').locator(foldSelector).click();

			await expectFolded(false, await waitForItemsWithValues(page, tree, ['1']));
			await expectFolded(true, await waitForItemsWithValues(page, tree, ['2']));
		});
	});

	test.describe('when items change', () => {
		const
			expectFolded = createExpectMod('folded');

		const defaultItems = [
			{value: 'bar'},

			{
				value: 'foo',
				children: [
					{value: 'foo_1'},
					{value: 'foo_2'},

					{
						value: 'foo_3',
						children: [{value: 'foo_3_1'}]
					},

					{value: 'foo_4'},
					{value: 'foo_5'},
					{value: 'foo_6'}
				].map((item) => ({...item, label: item.value}))
			}
		].map((item) => ({...item, label: item.value}));

		const newItems = [
			{value: 0},
			{value: 1, children: [{value: 3, label: '3'}]},
			{value: 2, children: [{value: 4, label: '4'}]}
		].map((item) => ({...item, label: `${item.value}`}));

		test('the `onItemsChange` event should be emitted', async ({page}) => {
			const
				tree = await renderTree(page);

			const changesLogPromise = tree.evaluate(async (ctx) => {
				const
					log: any[] = [];

				ctx.on('onItemsChange', (val: bTree['items']) => {
					log.push(Object.fastClone(val));
				});

				ctx.items = [{label: 'Bar', value: 1}];
				log.push(Object.fastClone(ctx.items));

				await ctx.unsafe.async.nextTick();
				return log;
			});

			await test.expect(changesLogPromise).resolves
				.toEqual([
					[{label: 'Bar', value: 1}],
					[{label: 'Bar', value: 1}]
				]);
		});

		test('new items should be unfolded with `folded = false`', async ({page}) => {
			const tree = await renderTree(page, {
				items: defaultItems,
				attrs: {folded: false}
			});

			await tree.evaluate((ctx, newItems) => {
				ctx.items = newItems;
			}, newItems);

			await expectFolded(false, await waitForItemsWithValues(page, tree, [1, 2]));
		});

		test('the unfolded node should become folded after change', async ({page}) => {
			const tree = await renderTree(page, {
				items: defaultItems
			});

			await test.expect(tree.evaluate((ctx) => ctx.unfold('foo'))).toBeResolvedTo(true);

			await expectFolded(false, await waitForItemsWithValues(page, tree, ['foo']));

			await tree.evaluate((ctx, newItems) => {
				ctx.items = newItems;
			}, newItems);

			await expectFolded(true, await waitForItemsWithValues(page, tree, [1]));
		});
	});

	test('`fold/unfold`', async ({page}) => {
		const items = [
			{
				value: 3,
				folded: true,

				children: [
					{
						value: 4,
						children: [{value: 6}]
					}
				]
			}
		];

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

		await tree.evaluate((ctx) => ctx.unfold(ctx.items[0].value));

		await expectFolded(false, [await waitForItemWithValue(page, tree, 3)]);
	});
});
