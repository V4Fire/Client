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

	getItemsCount,
	getRenderedNodesCount,
	waitForNumberOfNodes

} from 'components/base/b-tree/test/helpers';

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
	});

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

			test(
				'the tree nodes should be rendered sequentially, one by one, with a delay of half a second between each rendering',

				async ({page}) => {
					const tree = await renderTree(page, {
						items: [
							{
								label: 'root',
								value: '0',

								children: [
									{
										label: 'item 1',
										value: '1'
									},

									{
										label: 'item 2',
										value: '2'
									}
								]
							}
						],

						attrs: {
							renderChunks: 1,
							lazyRender: 'items',
							renderFilter: () => new Promise((res) => setTimeout(() => res(true), 500))
						}
					});

					await sleep(500);
					test.expect(await getRenderedNodesCount(tree)).toBe(1);

					await sleep(500);
					test.expect(await getRenderedNodesCount(tree)).toBe(2);

					await sleep(500);
					test.expect(await getRenderedNodesCount(tree)).toBe(3);
				}
			);
		});

		test.describe('`the `nestedRenderFilter` prop allows you to control the lazy rendering of nested sub-trees`', () => {
			test('should render top-level items immediately and other items after a delay', async ({page}) => {
				const tree = await renderTree(page, {
					items: [
						{
							label: 'root',
							value: '0',

							children: [
								{
									label: 'item 1',
									value: '1',

									children: [
										{label: 'item 1.1', value: '1.1'},
										{label: 'item 1.2', value: '1.2'},
										{label: 'item 1.3', value: '1.3'},
										{label: 'item 1.4', value: '1.4'},
										{label: 'item 1.5', value: '1.5'}
									]
								}
							]
						}
					],

					attrs: {
						lazyRender: 'items',
						renderChunks: 1,
						nestedRenderFilter: () => new Promise((res) => setTimeout(() => res(true), 500))
					}
				});

				await sleep(500);
				test.expect(await getRenderedNodesCount(tree)).toBe(2);

				await sleep(500);
				test.expect(await getRenderedNodesCount(tree)).toBe(3);

				await sleep(500);
				test.expect(await getRenderedNodesCount(tree)).toBe(4);

				await sleep(500);
				test.expect(await getRenderedNodesCount(tree)).toBe(5);

				await sleep(500);
				test.expect(await getRenderedNodesCount(tree)).toBe(6);

				await sleep(500);
				test.expect(await getRenderedNodesCount(tree)).toBe(7);
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

			await waitForNumberOfNodes(tree, 3);

			test.expect(await getRenderedNodesCount(tree)).toBe(3);

			await tree.evaluate((ctx) => ctx.unfold('1'));

			test.expect(await getRenderedNodesCount(tree)).not.toBe(8);

			await waitForNumberOfNodes(tree, 8);

			test.expect(await getRenderedNodesCount(tree)).toBe(8);
		}
	);

	function sleep(ms: number) {
		return new Promise((res) => setTimeout(() => res(true), ms));
	}
});
