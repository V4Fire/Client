/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { JSHandle } from 'playwright';

import test from 'tests/config/unit/test';

import type bTree from 'components/base/b-tree/b-tree';
import type { Item } from 'components/base/b-tree/b-tree';

import {renderTree, waitForCheckboxCount} from 'components/base/b-tree/test/helpers';
import BOM from "../../../../../../tests/helpers/bom";

test.describe('<b-tree> rendering modes', () => {
	const items: Item[] = [
		{
			label: 'root',
			value: '0',
			folded: false,

			children: [
				{
					label: 'item 1',
					value: '1',
					folded: true,

					children: [
						{label: 'item 1.1', value: '1.1'},
						{label: 'item 1.2', value: '1.2'},
						{label: 'item 1.3', value: '1.3'},
						{label: 'item 1.4', value: '1.4'},
						{label: 'item 1.5', value: '1.5'}
					]
				},

				{
					label: 'item 2',
					value: '2',
					folded: true,

					children: [
						{label: 'item 2.1', value: '2.1'},
						{label: 'item 2.2', value: '2.2'},
						{label: 'item 2.3', value: '2.3'},
						{label: 'item 2.4', value: '2.4'},
						{label: 'item 2.5', value: '2.5'}
					]
				}
			]
		}
	];

	test.beforeEach(async ({demoPage}) => {
		await demoPage.goto();
	});

	test.describe("when passing the prop `lazyRendering = 'folded'`, only the unfolded nodes should be rendered", () => {
		test("passing `lazyRendering = 'folded'`", async ({page}) => {
			const tree = await renderTree(page, {
				items,
				attrs: {lazyRender: 'folded'}
			});

			test.expect(await getRenderedNodesCount(tree)).toBe(3);

			await tree.evaluate((ctx) => ctx.unfold('1'));
			await waitForNumberOfNodes(tree, 8);

			test.expect(await getRenderedNodesCount(tree)).toBe(8);
		});

		test('by default folded nodes should not be rendered', async ({page}) => {
			const tree = await renderTree(page, {items});

			test.expect(await getRenderedNodesCount(tree)).toBe(3);

			await tree.evaluate((ctx) => ctx.unfold('1'));
			await waitForNumberOfNodes(tree, 8);

			test.expect(await getRenderedNodesCount(tree)).toBe(8);
		});
	})

	test(
		'when passing the prop `lazyRendering = false`, the tree should be fully rendered immediately',

		async ({page}) => {
			const tree = await renderTree(page, {
				items,
				attrs: {lazyRender: false}
			});

			const itemsCount = getItemsCount(items);

			test.expect(await getRenderedNodesCount(tree)).toBe(itemsCount);
		}
	);

	test.describe("when passing the prop `lazyRendering = 'items'`, the tree should be rendered fully, but with deferred chunks", () => {
		test("passing `lazyRendering = 'items'`", async ({page}) => {
			const tree = await renderTree(page, {
				items,
				attrs: {lazyRender: 'items'}
			});

			const itemsCount = getItemsCount(items);

			test.expect(await getRenderedNodesCount(tree)).not.toBe(itemsCount);

			await waitForNumberOfNodes(tree, itemsCount);

			test.expect(await getRenderedNodesCount(tree)).toBe(itemsCount);
		});

		test(
			"passing `lazyRendering = true` should be equivalent to `lazyRendering = 'items'`",

			async ({page}) => {
				const tree = await renderTree(page, {
					items,
					attrs: {lazyRender: true}
				});

				const itemsCount = getItemsCount(items);

				test.expect(await getRenderedNodesCount(tree)).not.toBe(itemsCount);

				await waitForNumberOfNodes(tree, itemsCount);

				test.expect(await getRenderedNodesCount(tree)).toBe(itemsCount);
			}
		);

		test.describe('the `renderFilter` prop allows you to control the lazy rendering', () => {
			test.only(
				'the tree nodes should be rendered sequentially, one by one, with a delay of half a second between each rendering',

				async ({page}) => {
					const tree = await renderTree(page, {
						items,
						attrs: {
							renderChunks: 1,
							lazyRender: 'items',
							renderFilter: () => new Promise((res) => setTimeout(() => res(true), 500))
						}
					});

					const waitForRender = () => tree.evaluate((ctx) => ctx.unsafe.async.sleep(500));

					await waitForRender();
					test.expect(await getRenderedNodesCount(tree)).toBe(1);

					await waitForRender();
					test.expect(await getRenderedNodesCount(tree)).toBe(2);

					await waitForRender();
					test.expect(await getRenderedNodesCount(tree)).toBe(3);
				}
			);

			test('only the first two levels of the tree should be rendered', async ({page}) => {
				const tree = await renderTree(page, {
					items,
					attrs: {
						lazyRender: 'items',
						renderFilter: (ctx: bTree) => ctx.level < 2
					}
				});

				test.expect(await getRenderedNodesCount(tree)).toBe(3);
			});
		});
	});

	test(
		"when passing the prop `lazyRendering = 'all'`, only the unfolded nodes should be rendered with deferred chunks",

		async ({page}) => {
			const tree = await renderTree(page, {
				items,
				attrs: {
					renderChunks: 1,
					lazyRender: 'all'
				}
			});

			test.expect(await getRenderedNodesCount(tree)).not.toBe(3);

			await waitForNumberOfNodes(tree, 3);

			test.expect(await getRenderedNodesCount(tree)).toBe(3);

			await tree.evaluate((ctx) => ctx.unfold('1'));

			test.expect(await getRenderedNodesCount(tree)).not.toBe(8);

			await waitForNumberOfNodes(tree, 8);

			test.expect(await getRenderedNodesCount(tree)).toBe(8);
		}
	);

	type Items = typeof items;

	function getItemsCount(items: Items) {
		let count = 0;

		items.forEach(({children}) => {
			count++;

			if (children != null) {
				count += getItemsCount(children);
			}
		})

		return count;
	}

	function getRenderedNodesCount(tree: JSHandle<bTree>) {
		return tree.evaluate((ctx) => {
			const nodes = ctx.$el!.querySelectorAll(`.${ctx.provide.fullElementName('node')}`);
			return nodes.length;
		});
	}

	function waitForNumberOfNodes(tree: JSHandle<bTree>, number: number) {
		return tree.evaluate(({unsafe}, number) => {
			return unsafe.async.wait(() => {
				const nodes = unsafe.$el!.querySelectorAll(`.${unsafe.provide.fullElementName('node')}`);
				return nodes.length === number;
			})
		}, number);
	}
});
