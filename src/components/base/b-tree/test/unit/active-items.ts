/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { JSHandle } from 'playwright';

import test from 'tests/config/unit/test';

import Utils from 'tests/helpers/utils';

import type bTree from 'components/base/b-tree/b-tree';
import type { Item } from 'components/base/b-tree/b-tree';

import { renderTree, createTreeSelector, createExpectMod, waitForItemsWithValues } from 'components/base/b-tree/test/helpers';

test.describe('<b-tree> active items API', () => {
	const
		expectFolded = createExpectMod('folded'),
		expectActive = createExpectMod('active');

	const items: Item[] = [
		{value: 0, label: '0'},
		{value: 1, label: '1'},

		{
			value: 2,
			label: '2',
			children: [
				{
					value: 3,
					label: '3',
					children: [{value: 4, label: '4'}]
				}
			]
		},

		{value: 5, label: '5'},

		{
			value: 6,
			label: '6',
			activatable: false
		},

		{value: '007', label: '7'}
	];

	test.beforeEach(async ({demoPage}) => {
		await demoPage.goto();
	});

	test.describe('initialization with specifying active items', () => {
		test('should have the `active` item', async ({page}) => {
			const tree = await renderTree(page, {
				items,
				attrs: {
					active: 0
				}
			});

			test.expect(await tree.evaluate((ctx) => ctx.active)).toBe(0);

			test.expect(
				await tree.evaluate(async (ctx) =>
					ctx.unsafe.block?.getElementMod(<Element>await ctx.activeElement, 'node', 'active'))
			).toBe('true');
		});

		test.describe('with `multiple = true`', () => {
			const evaluateActive = (tree: JSHandle<bTree>) => tree.evaluate((ctx) => [...<Set<number>>ctx.active]);

			test('the `active` prop should accept scalar value', async ({page}) => {
				const tree = await renderTree(page, {items, attrs: {active: 0, multiple: true}});
				await test.expect(evaluateActive(tree)).resolves.toEqual([0]);
			});

			test('the `active` prop should accept `Array`', async ({page}) => {
				const tree = await renderTree(page, {items, attrs: {active: [0, 1], multiple: true}});
				test.expect(await evaluateActive(tree)).toEqual([0, 1]);
			});

			test('the `active` prop should accept `Iterable`', async ({page}) => {
				const tree = await renderTree(
					page,
					{items, attrs: {active: Utils.evalInBrowser(() => [0, 1].values()), multiple: true}}
				);

				test.expect(await evaluateActive(tree)).toEqual([0, 1]);
			});

			test('the `active` prop should accept `String`', async ({page}) => {
				const tree = await renderTree(
					page,
					{items, attrs: {active: '007', multiple: true}}
				);

				test.expect(await evaluateActive(tree)).toEqual(['007']);
			});
		});
	});

	test.describe('`active` status', () => {
		test('should not be changeable with `activatable = false` on an item', async ({page}) => {
			const tree = await renderTree(page, {items});

			await tree.evaluate((ctx) => ctx.setActive(0));
			await tree.evaluate((ctx) => ctx.setActive(6));

			test.expect(await tree.evaluate((ctx) => ctx.active)).toBe(0);
		});

		test('should not be changeable by default', async ({page}) => {
			const tree = await renderTree(page, {items});

			test.expect(
				await tree.evaluate((ctx) => {
					ctx.setActive(0);
					return ctx.active;
				})
			).toBe(0);

			test.expect(
				await tree.evaluate((ctx) => {
					ctx.setActive(1);
					return ctx.active;
				})
			).toBe(1);

			test.expect(await tree.evaluate((ctx) => ctx.unsetActive(1))).toBeFalsy();
			test.expect(await tree.evaluate((ctx) => ctx.active)).toBe(1);
		});

		test('should be changeable with `cancelable = true`', async ({page}) => {
			const tree = await renderTree(page, {
				items,
				attrs: {cancelable: true}
			});

			test.expect(
				await tree.evaluate((ctx) => {
					ctx.setActive(1);
					return ctx.active;
				})
			).toBe(1);

			test.expect(await tree.evaluate((ctx) => ctx.unsetActive(1))).toBeTruthy();
			test.expect(await tree.evaluate((ctx) => ctx.active)).toBeUndefined();

			test.expect(
				await tree.evaluate((ctx) => {
					ctx.toggleActive(1);
					return ctx.active;
				})
			).toBe(1);
		});

		test('should be changeable with `multiple = true`', async ({page}) => {
			const tree = await renderTree(page, {
				items,
				attrs: {multiple: true}
			});

			test.expect(
				await tree.evaluate((ctx) => {
					ctx.setActive(1);
					ctx.setActive(0);
					return [...(<Set<number>>ctx.active).keys()];
				})
			).toEqual([1, 0]);

			test.expect(
				await tree.evaluate((ctx) => {
					ctx.unsetActive(1);
					ctx.unsetActive(0);
					return [...(<Set<number>>ctx.active).values()];
				})
			).toEqual([]);
		});

		test('should not be changeable with `multiple = true; cancelable = false`', async ({page}) => {
			const tree = await renderTree(page, {
				items,
				attrs: {
					multiple: true,
					cancelable: false
				}
			});

			test.expect(
				await tree.evaluate((ctx) => {
					ctx.setActive(1);
					ctx.setActive(5);
					return [...(<Set<number>>ctx.active).keys()];
				})
			).toEqual([1, 5]);

			test.expect(
				await tree.evaluate((ctx) => {
					ctx.unsetActive(1);
					ctx.unsetActive(5);
					return [...(<Set<number>>ctx.active).values()];
				})
			).toEqual([1, 5]);
		});

		test('should be changeable with `multiple = true; cancelable = true`', async ({page}) => {
			const tree = await renderTree(page, {
				items,
				attrs: {
					multiple: true,
					cancelable: true
				}
			});

			test.expect(
				await tree.evaluate((ctx) => {
					ctx.setActive(1);
					ctx.setActive(0);
					return [...<Set<number>>ctx.active];
				})
			).toEqual([1, 0]);

			test.expect(
				await tree.evaluate((ctx) => {
					ctx.unsetActive(1);
					ctx.unsetActive(0);
					return [...<Set<number>>ctx.active];
				})
			).toEqual([]);
		});

		test('should change correctly with `multiple = true` when string value is passed', async ({page}) => {
			const tree = await renderTree(page, {
				items,
				attrs: {
					multiple: true
				}
			});

			test.expect(
				await tree.evaluate((ctx) => {
					ctx.setActive(1);
					ctx.setActive('007');
					return [...<Set<number>>ctx.active];
				})
			).toEqual([1, '007']);

			test.expect(
				await tree.evaluate((ctx) => {
					ctx.unsetActive(1);
					return [...<Set<number>>ctx.active];
				})
			).toEqual(['007']);

			test.expect(
				await tree.evaluate((ctx) => {
					ctx.unsetActive('007');
					return [...<Set<number>>ctx.active];
				})
			).toEqual([]);
		});
	});

	test.describe('changing the active item', () => {
		test('should unfold parents when `setActive` is invoked', async ({page}) => {
			const
				tree = await renderTree(page, {items});

			await tree.evaluate((ctx) => ctx.setActive(4));

			const nodes = await waitForItemsWithValues(page, tree, [2, 3]);

			await expectFolded(false, nodes);
		});

		test('should unfold parents when `toggleActive` is invoked', async ({page}) => {
			const
				tree = await renderTree(page, {items});

			await tree.evaluate((ctx) => ctx.toggleActive(4));

			const nodes = await waitForItemsWithValues(page, tree, [2, 3]);

			await expectFolded(false, nodes);
		});
	});

	test.describe('`toggleActive`', () => {
		test('should accept a scalar value with `multiple = true`', async ({page}) => {
			const tree = await renderTree(page, {
				items,
				attrs: {multiple: true}
			});

			test.expect(
				await tree.evaluate((ctx) => {
					ctx.toggleActive(1);
					ctx.toggleActive(0);
					ctx.toggleActive(1);
					return [...<Set<number>>ctx.active];
				})
			).toEqual([0]);
		});

		test('should accept a string value with `multiple = true`', async ({page}) => {
			const tree = await renderTree(page, {
				items,
				attrs: {multiple: true}
			});

			test.expect(
				await tree.evaluate((ctx) => {
					ctx.toggleActive(1);
					ctx.toggleActive('007');
					ctx.toggleActive(1);
					return [...<Set<number>>ctx.active];
				})
			).toEqual(['007']);
		});

		test('should accept `Iterable` with `multiple = true`', async ({page}) => {
			const tree = await renderTree(page, {
				items,
				attrs: {multiple: true}
			});

			test.expect(
				await tree.evaluate((ctx) => {
					ctx.toggleActive(new Set([0, 1]));
					return [...<Set<number>>ctx.active];
				})
			).toEqual([0, 1]);

			const nodes = await waitForItemsWithValues(page, tree, [0, 1]);

			await expectActive(true, nodes);

			test.expect(
				await tree.evaluate((ctx) => {
					ctx.toggleActive([1, 3].values());
					return [...<Set<number>>ctx.active];
				})
			).toEqual([0, 3]);

			const
				activeNodes = await waitForItemsWithValues(page, tree, [0, 3]),
				inactiveNodes = await waitForItemsWithValues(page, tree, [1]);

			await expectActive(true, activeNodes);
			await expectActive(false, inactiveNodes);
		});

		test('should unset the previous active items with `unsetPrevious = true`', async ({page}) => {
			const
				tree = await renderTree(page, {items, attrs: {multiple: true}});

			test.expect(
				await tree.evaluate((ctx) => {
					ctx.toggleActive(new Set([0, 1]));
					return [...<Set<number>>ctx.active];
				})
			).toEqual([0, 1]);

			test.expect(
				await tree.evaluate((ctx) => {
					ctx.toggleActive([2, 4].values(), true);
					return [...<Set<number>>ctx.active];
				})
			).toEqual([2, 4]);
		});
	});

	test('should emit change events on click', async ({page}) => {
		const
			tree = await renderTree(page, {items}),
			nodeSelector = createTreeSelector('node');

		const scan = tree.evaluate((ctx) => new Promise((resolve) => {
			const
				log: any[] = [];

			ctx.on('onChange', (value) => {
				log.push(['change', value]);
				onEvent();
			});

			ctx.on('onActionChange', (value) => {
				log.push(['actionChange', value]);
				onEvent();
			});

			log.push(ctx.setActive(0));

			function onEvent() {
				if (log.length >= 4) {
					resolve(log);
				}
			}
		}));

		await page.click(`${nodeSelector}:nth-child(2)`);

		await test.expect(scan).resolves.toEqual([
			true,
			['change', 0],
			['actionChange', 1],
			['change', 1]
		]);
	});

	test('should watch the changes of `active`', async ({page}) => {
		const
			tree = await renderTree(page, {items});

		test.expect(
			await tree.evaluate(async (ctx) => {
				const
					log: any[] = [];

				ctx.watch('active', {immediate: true}, (val, oldVal, p) => {
					log.push([val, oldVal, p?.path.join('.')]);
				});

				ctx.setActive(0);

				await ctx.nextTick();

				ctx.setActive(1);

				await ctx.nextTick();

				return log;
			})
		).toEqual([
			[undefined, undefined, undefined],
			[0, undefined, 'active'],
			[1, 0, 'active']
		]);
	});

	test('should watch the changes of `active` with `multiple = true`', async ({page}) => {
		const tree = await renderTree(page, {
			items,
			attrs: {multiple: true}
		});

		test.expect(
			await tree.evaluate(async (ctx) => {
				const
					log: any[] = [];

				ctx.watch('active', {immediate: true}, (val, oldVal, p) => {
					log.push([[...val], oldVal != null ? [...oldVal] : undefined, p?.path.join('.')]);
				});

				ctx.setActive(0);

				await ctx.nextTick();

				ctx.setActive(1);

				await ctx.nextTick();

				return log;
			})
		).toEqual([
			[[], undefined, undefined],
			[[0], [], 'active'],
			[[0, 1], [0], 'active']
		]);
	});

	test.describe('`traverseActiveNodes`', () => {
		test('should return the IDs and values of items associated with the active nodes', async ({page}) => {
			const tree = await renderTree(page, {
				items,
				attrs: {
					active: [0, 1],
					multiple: true
				}
			});

			test.expect(
				await tree.evaluate((ctx) =>
					Array.from(ctx.unsafe.traverseActiveNodes())
						.map(([, ctx]) => ctx))

			).toEqual([
				{id: 0, value: 0},
				{id: 1, value: 1}
			]);
		});
	});

	test.describe('`activeElement`', () => {
		test('should have one active element', async ({page}) => {
			const tree = await renderTree(page, {items, attrs: {active: 0}});
			test.expect(await tree.evaluate((ctx) => (<HTMLElement>ctx.activeElement).tagName)).toBe('DIV');
		});

		test('should have multiple active elements with `multiple = true`', async ({page}) => {
			const tree = await renderTree(page, {
				items,
				attrs: {
					active: [0, 1],
					multiple: true
				}
			});

			test.expect(await tree.evaluate((ctx) => Array.from(<HTMLElement[]>ctx.activeElement).map((el) => el.tagName)))
				.toEqual(['DIV', 'DIV']);
		});
	});
});
