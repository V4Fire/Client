/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { ElementHandle, JSHandle, Page } from 'playwright';

import test from 'tests/config/unit/test';

import BOM from 'tests/helpers/bom';
import DOM from 'tests/helpers/dom';
import Component from 'tests/helpers/component';

import type bTree from 'components/base/b-tree/b-tree';
import type { Item } from 'components/base/b-tree/interface';

import { checkOptionTree, waitForItem, interceptTreeRequest } from 'components/base/b-tree/test/helpers';

test.describe('<b-tree>', () => {

	const
		elementSelector = '.b-checkbox',
		defaultItems = [
			{id: 'bar'},

			{
				id: 'foo',
				children: [
					{id: 'foo_1'},
					{id: 'foo_2'},

					{
						id: 'foo_3',
						children: [{id: 'foo_3_1'}]
					},

					{id: 'foo_4'},
					{id: 'foo_5'},
					{id: 'foo_6'}
				]
			}
		];

	test.beforeEach(async ({demoPage}) => {
		await demoPage.goto();
	});

	test.describe('slots', () => {
		test.describe('`default`', () => {
			test('should render items using the provided slot', async ({page}) => {
				const target = await renderTree(page, {
					items: defaultItems,
					children: {
						default: {
							type: 'div',
							children: {
								default: 'Item'
							},
							attrs: {
								'data-test-ref': 'item'
							}
						}
					}
				});

				await test.expect(target.evaluate((ctx) => ctx.isFunctional))
					.toBeResolvedTo(false);

				const
					promises = await Promise.all(checkOptionTree(page, defaultItems, {target})),
					refs = await DOM.getRefs(page, 'item');

				test.expect(promises.length).toEqual(refs.length);
			});
		});
	});

	test.describe('`items`', () => {
		test('should initialize with provided items', async ({page}) => {
			const target = await renderTree(page);

			await test.expect(target.evaluate((ctx) => ctx.isFunctional))
				.toBeResolvedTo(false);

			const promises = await Promise.all(checkOptionTree(page, defaultItems, {target}));

			await waitForCheckboxCount(page, promises.length);
		});

		test('all items should be unfolded by default with `folded = false`', async ({page}) => {
			const items = [
				{id: 'bar'},

				{
					id: 'foo',
					children: [
						{id: 'foo_1'},
						{id: 'foo_2'},

						{
							id: 'foo_3',
							folded: false,
							children: [{id: 'foo_3_1', children: [{id: 'foo_3_1_1'}]}]
						}
					]
				}
			];

			const target = await renderTree(page, {items, attrs: {folded: false}});
			await Promise.all(checkOptionTree(page, items, {target}));
		});

		test.describe('`renderFilter`', () => {
			test('should render items by one with a timeout', async ({page}) => {
				const target = await renderTree(page, {attrs: {
					renderChunks: 1,
					renderFilter: () => new Promise((res) => setTimeout(() => res(true), 0.5.second()))
				}});

				await BOM.waitForIdleCallback(page);

				const waitForRender = () => target.evaluate((ctx) => ctx.unsafe.async.sleep(500));

				await waitForRender();
				await waitForCheckboxCount(page, 1);

				await waitForRender();
				await waitForCheckboxCount(page, 2);

				await waitForRender();
				await waitForCheckboxCount(page, 3);
			});

			test('should render relying on the context data', async ({page}) => {
				await renderTree(page, {
					attrs: {
						renderFilter: (ctx) => ctx.level === 0
					}
				});

				await BOM.waitForIdleCallback(page);

				await waitForCheckboxCount(page, 2);
			});
		});

		test.describe('`nestedRenderFilter`', () => {
			test('should render top-level items immediately and other items after a delay', async ({page}) => {
				const items = [
					{
						id: 'foo',
						children: [
							{id: 'foo_1'},
							{id: 'foo_2'},

							{
								id: 'foo_3',
								children: [{id: 'foo_3_1', children: [{id: 'foo_3_1_1'}]}]
							}
						]
					},

					{id: 'bar'}
				];

				const target = await renderTree(page, {
					items,
					attrs: {
						renderChunks: 1,
						nestedRenderFilter: () => new Promise((res) => setTimeout(() => res(true), 0.5.second()))
					}
				});

				const waitForRender = () => target.evaluate((ctx) => ctx.unsafe.async.sleep(500));

				await waitForCheckboxCount(page, 2);

				await waitForRender();
				await waitForCheckboxCount(page, 3);

				await waitForRender();
				await waitForCheckboxCount(page, 4);

				await waitForRender();
				await waitForCheckboxCount(page, 5);

				await waitForRender();
				await waitForCheckboxCount(page, 6);

				await waitForRender();
				await waitForCheckboxCount(page, 7);
			});
		});

		/**
		 * Returns rendered `b-tree` component
		 *
		 * @param page
		 * @param options
		 */
		async function renderTree(
			page: Page,
			options: Partial<{ items: Item[] } & RenderComponentsVnodeParams> = {}
		): Promise<JSHandle<bTree>> {
			const {items = defaultItems, attrs, children} = options;
			const baseAttrs = {
				theme: 'demo',
				item: 'b-checkbox-functional',
				items,
				id: 'target',
				renderChunks: 2
			};

			const scheme: RenderComponentsVnodeParams[] = [
				{
					attrs: {
						...baseAttrs,
						...attrs
					},

					children
				}
			];

			await Component.createComponent(page, 'b-tree', scheme);

			return Component.waitForComponentByQuery(page, '#target');
		}
	});

	test.describe('`dataProvider`', () => {
		test.beforeEach(async ({context}) => {
			await interceptTreeRequest(context);
		});

		// FIXME: vue3 render is broken @see https://github.com/V4Fire/Client/issues/822
		test.skip('should load data from the data provider', async ({page}) => {
			await renderTree(
				page,
				{
					attrs: {
						dataProvider: 'Provider',
						item: 'b-checkbox-functional'
					}
				}
			);

			await BOM.waitForIdleCallback(page);

			await waitForCheckboxCount(page, 14);
		});
	});

	test.describe('public API', () => {
		const
			items = [
				{id: '1'},
				{id: '2'},
				{
					id: '3',
					children: [
						{
							id: '4',
							children: [{id: '6'}]
						}
					]
				},
				{id: '5'}
			];

		test('traverse', async ({page}) => {
			const target = await renderTree(page, {items});

			let res = await target.evaluate((ctx) => [...ctx.traverse()].map(([item]) => item.id));

			test.expect(res).toEqual([1, 2, 3, 5, 4, 6].map(String));

			res = await target.evaluate((ctx) => [...ctx.traverse(ctx, {deep: false})].map(([item]) => item.id));

			test.expect(res).toEqual([1, 2, 3, 5].map(String));
		});

		test('fold/unfold', async ({page}) => {
			const testFoldedModIs = async (
				flag: boolean,
				nodes: Array<ElementHandle<HTMLElement | SVGElement>>
			) => {
				const classes = await Promise.all(nodes.map((node) => node.getAttribute('class')));

				test.expect(classes.every((x) => x?.includes(flag ? 'folded_true' : 'folded_false')))
					.toBeTruthy();
			};

			const target = await renderTree(page, {items});

			await target.evaluate(async (ctx) => ctx.unfold());

			await testFoldedModIs(false, [await waitForItem(page, 3)]);

			await target.evaluate(async (ctx) => ctx.fold());

			await testFoldedModIs(true, [
				await waitForItem(page, 3),
				await waitForItem(page, 4)
			]);

			await target.evaluate((ctx) => ctx.unfold(ctx.items[2]));

			await testFoldedModIs(false, [await waitForItem(page, 3)]);
		});
	});

	/**
	 * Returns rendered `b-tree` component
	 *
	 * @param page
	 * @param options
	 */
	async function renderTree(
		page: Page,
		options: Partial<{ items: Item[] } & RenderComponentsVnodeParams> = {}
	): Promise<JSHandle<bTree>> {
		const {items, attrs, children} = options;

		await Component.createComponent(page, 'b-tree', [
			{
				attrs: {
					items,
					id: 'target',
					theme: 'demo',
					...attrs
				},
				children
			}
		]);

		return Component.waitForComponentByQuery(page, '#target');
	}

	/**
	 * Checks if page has expected count of b-checkbox elements
	 *
	 * @param page
	 * @param expectedCount
	 */
	async function waitForCheckboxCount(page: Page, expectedCount: number) {
		await test.expect(page.locator(elementSelector)).toHaveCount(expectedCount);
	}
});
