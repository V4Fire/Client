/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import test from 'tests/config/unit/test';

import BOM from 'tests/helpers/bom';

import { renderTree, checkOptionTree, waitForCheckboxCount, createTestModIs, waitForItems, getDefaultItems } from 'components/base/b-tree/test/helpers';

test.describe('<b-tree>', () => {
	const
		testFoldedModIs = createTestModIs('folded'),
		defaultItems = getDefaultItems();

	test.beforeEach(async ({demoPage}) => {
		await demoPage.goto();
	});

	test.describe('`items`', () => {
		const baseAttrs = {
			item: 'b-checkbox-functional',
			renderChunks: 2
		};

		test('should initialize with provided items', async ({page}) => {
			const target = await renderTree(page, {items: defaultItems, attrs: baseAttrs, children: []});

			await test.expect(target.evaluate((ctx) => ctx.isFunctional))
				.toBeResolvedTo(false);

			const promises = await Promise.all(checkOptionTree(page, defaultItems, {target}));

			await waitForCheckboxCount(page, promises.length);
		});

		test('all items should be unfolded by default with `folded = false`', async ({page}) => {
			const items = [
				{value: 'bar'},

				{
					value: 'foo',
					children: [
						{value: 'foo_1'},
						{value: 'foo_2'},

						{
							value: 'foo_3',
							folded: false,
							children: [{value: 'foo_3_1', children: [{value: 'foo_3_1_1'}]}]
						}
					]
				}
			];

			const target = await renderTree(page, {items, attrs: {...baseAttrs, folded: false}});
			await Promise.all(checkOptionTree(page, items, {target}));
		});

		test.describe('`renderFilter`', () => {
			test('should render items by one with a timeout', async ({page}) => {
				const target = await renderTree(page, {
					items: defaultItems,
					children: [],
					attrs: {
						...baseAttrs,
						renderChunks: 1,
						renderFilter: () => new Promise((res) => setTimeout(() => res(true), 0.5.second()))
					}
				});

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
					items: defaultItems,
					children: [],
					attrs: {
						...baseAttrs,
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
						value: 'foo',
						children: [
							{value: 'foo_1'},
							{value: 'foo_2'},

							{
								value: 'foo_3',
								children: [{value: 'foo_3_1', children: [{value: 'foo_3_1_1'}]}]
							}
						]
					},

					{value: 'bar'}
				];

				const target = await renderTree(page, {
					items,
					attrs: {
						...baseAttrs,
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
	});

	test.describe('when items change', () => {
		const newItems = [
			{value: 0},
			{value: 1, children: [{value: 3, label: '3'}]},
			{value: 2, children: [{value: 4, label: '4'}]}
		].map((item) => ({...item, label: `${item.value}`}));

		test('`onItemsChange` event should be emitted', async ({page}) => {
			const
				target = await renderTree(page),
				changesLogPromise = target.evaluate(async (ctx) => {
					const
						log: any[] = [];

					ctx.on('onItemsChange', (val) => {
						log.push(Object.fastClone(val));
					});

					ctx.items = [{label: 'Bar', value: 1}];

					log.push(Object.fastClone(ctx.items));

					await ctx.unsafe.localEmitter.promisifyOnce('asyncRenderComplete');
					return log;
				});

			test.expect(await changesLogPromise)
				.toEqual([
					[{label: 'Bar', value: 1}],
					[{label: 'Bar', value: 1}]
				]);
		});

		test('new items should be unfolded with `folded = false`', async ({page}) => {
			const
				target = await renderTree(page, {items: defaultItems, attrs: {folded: false}});

			await target.evaluate(async (ctx, newItems) => {
				ctx.items = newItems;

				await ctx.unsafe.localEmitter.promisifyOnce('asyncRenderComplete');
			}, newItems);

			await testFoldedModIs(false, await waitForItems(page, target, [1, 2]));
		});

		test('unfolded node should become folded after change', async ({page}) => {
			const
				target = await renderTree(page, {items: defaultItems});

			await test.expect(target.evaluate(async (ctx) => ctx.unfold('foo'))).toBeResolvedTo(true);

			await testFoldedModIs(false, await waitForItems(page, target, ['foo']));

			await target.evaluate(async (ctx, newItems) => {
				ctx.items = newItems;

				await ctx.unsafe.localEmitter.promisifyOnce('asyncRenderComplete');
			}, newItems);

			await testFoldedModIs(true, await waitForItems(page, target, [1]));
		});
	});
});
