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
import type { Item } from 'components/base/b-tree/interface';

import { renderTree, createTreeSelector, createTestModIs, waitForItems } from 'components/base/b-tree/test/helpers';

test.describe('<b-tree> active items', () => {
	const
		testFoldedModIs = createTestModIs('folded'),
		testActiveModIs = createTestModIs('active');

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
		}
	];

	test.beforeEach(async ({demoPage}) => {
		await demoPage.goto();
	});

	test.describe('initialize', () => {
		test('should have `active` item', async ({page}) => {
			const target = await renderTree(page, {items, attrs: {active: 0}});

			test.expect(await target.evaluate((ctx) => ctx.active)).toBe(0);
			test.expect(
				await target.evaluate(async (ctx) => ctx.unsafe.block?.getElementMod(<Element>await ctx.activeElement, 'node', 'active'))
			).toBe('true');
		});

		test.describe('with `multiple = true`', () => {
			const evaluateActive = (target: JSHandle<bTree>) => target.evaluate((ctx) => [...<Set<number>>ctx.active]);

			test('`active` prop should accept scalar value', async ({page}) => {
				const target = await renderTree(page, {items, attrs: {active: 0, multiple: true}});
				test.expect(await evaluateActive(target)).toEqual([0]);
			});

			test('`active` prop should accept `Array`', async ({page}) => {
				const target = await renderTree(page, {items, attrs: {active: [0, 1], multiple: true}});
				test.expect(await evaluateActive(target)).toEqual([0, 1]);
			});

			test('`active` prop should accept `Iterable`', async ({page}) => {
				const target = await renderTree(
					page,
					{items, attrs: {active: Utils.evalInBrowser(() => [0, 1].values()), multiple: true}}
				);
				test.expect(await evaluateActive(target)).toEqual([0, 1]);
			});
		});
	});

	test.describe('`active`', () => {
		test('should not be changeable with `activatable = false`', async ({page}) => {
			const target = await renderTree(page, {items});

			await target.evaluate((ctx) => ctx.setActive(0));
			await target.evaluate((ctx) => ctx.setActive(6));

			test.expect(await target.evaluate((ctx) => ctx.active)).toBe(0);
		});

		test('should be changeable', async ({page}) => {
			const
				target = await renderTree(page, {items});

			test.expect(
				await target.evaluate((ctx) => {
					ctx.setActive(0);
					return ctx.active;
				})
			).toBe(0);

			test.expect(
				await target.evaluate((ctx) => {
					ctx.setActive(1);
					return ctx.active;
				})
			).toBe(1);

			test.expect(await target.evaluate((ctx) => ctx.unsetActive(1))).toBeFalsy();
			test.expect(await target.evaluate((ctx) => ctx.active)).toBe(1);
		});

		test('should be changeable with `cancelable = true`', async ({page}) => {
			const
				target = await renderTree(page, {items, attrs: {cancelable: true}});

			test.expect(
				await target.evaluate((ctx) => {
					ctx.setActive(1);
					return ctx.active;
				})
			).toBe(1);

			test.expect(await target.evaluate((ctx) => ctx.unsetActive(1))).toBeTruthy();
			test.expect(await target.evaluate((ctx) => ctx.active)).toBeUndefined();

			test.expect(
				await target.evaluate((ctx) => {
					ctx.toggleActive(1);
					return ctx.active;
				})
			).toBe(1);
		});

		test('should be changeable with `multiple = true`', async ({page}) => {
			const
				target = await renderTree(page, {items, attrs: {multiple: true}});

			test.expect(
				await target.evaluate((ctx) => {
					ctx.setActive(1);
					ctx.setActive(0);
					return [...(<Set<number>>ctx.active).keys()];
				})
			).toEqual([1, 0]);

			test.expect(
				await target.evaluate((ctx) => {
					ctx.unsetActive(1);
					ctx.unsetActive(0);
					return [...(<Set<number>>ctx.active).values()];
				})
			).toEqual([]);
		});

		test('should be changeable with `multiple = true; cancelable = false`', async ({page}) => {
			const
				target = await renderTree(page, {items, attrs: {multiple: true, cancelable: false}});

			test.expect(
				await target.evaluate((ctx) => {
					ctx.setActive(1);
					ctx.setActive(5);
					return [...(<Set<number>>ctx.active).keys()];
				})
			).toEqual([1, 5]);

			test.expect(
				await target.evaluate((ctx) => {
					ctx.unsetActive(1);
					ctx.unsetActive(5);
					return [...(<Set<number>>ctx.active).values()];
				})
			).toEqual([1, 5]);
		});

		test('should be changeable with `multiple = true; cancelable = true`', async ({page}) => {
			const
				target = await renderTree(page, {items, attrs: {multiple: true, cancelable: true}});

			test.expect(
				await target.evaluate((ctx) => {
					ctx.setActive(1);
					ctx.setActive(0);
					return [...<Set<number>>ctx.active];
				})
			).toEqual([1, 0]);

			test.expect(
				await target.evaluate((ctx) => {
					ctx.unsetActive(1);
					ctx.unsetActive(0);
					return [...<Set<number>>ctx.active];
				})
			).toEqual([]);
		});
	});

	test.describe('changing active item', () => {
		test('should unfold parents when `setActive` is invoked', async ({page}) => {
			const
				target = await renderTree(page, {items});

			await target.evaluate((ctx) => ctx.setActive(4));

			const nodes = await waitForItems(page, target, [2, 3]);

			await testFoldedModIs(false, nodes);
		});

		test('should unfold parents when `toggleActive` is invoked', async ({page}) => {
			const
				target = await renderTree(page, {items});

			await target.evaluate((ctx) => ctx.toggleActive(4));

			const nodes = await waitForItems(page, target, [2, 3]);

			await testFoldedModIs(false, nodes);
		});
	});

	test.describe('`toggleActive`', () => {
		test('should accept scalar value with `multiple = true`', async ({page}) => {
			const
				target = await renderTree(page, {items, attrs: {multiple: true}});

			test.expect(
				await target.evaluate((ctx) => {
					ctx.toggleActive(1);
					ctx.toggleActive(0);
					ctx.toggleActive(1);
					return [...<Set<number>>ctx.active];
				})
			).toEqual([0]);
		});

		test('should accept `Iterable` with `multiple = true`', async ({page}) => {
			const
				target = await renderTree(page, {items, attrs: {multiple: true}});

			test.expect(
				await target.evaluate((ctx) => {
					ctx.toggleActive(new Set([0, 1]));
					return [...<Set<number>>ctx.active];
				})
			).toEqual([0, 1]);

			const nodes = await waitForItems(page, target, [0, 1]);

			await testActiveModIs(true, nodes);

			test.expect(
				await target.evaluate((ctx) => {
					ctx.toggleActive([1, 3].values());
					return [...<Set<number>>ctx.active];
				})
			).toEqual([0, 3]);

			const
				activeNodes = await waitForItems(page, target, [0, 3]),
				inactiveNodes = await waitForItems(page, target, [1]);

			await testActiveModIs(true, activeNodes);
			await testActiveModIs(false, inactiveNodes);

		});

		test('should unset previous active items with `unsetPrevious = true`', async ({page}) => {
			const
				target = await renderTree(page, {items, attrs: {multiple: true}});

			test.expect(
				await target.evaluate((ctx) => {
					ctx.toggleActive(new Set([0, 1]));
					return [...<Set<number>>ctx.active];
				})
			).toEqual([0, 1]);

			test.expect(
				await target.evaluate((ctx) => {
					ctx.toggleActive([2, 4].values(), true);
					return [...<Set<number>>ctx.active];
				})
			).toEqual([2, 4]);
		});
	});

	test('should emit change events on click', async ({page}) => {
		const
			target = await renderTree(page, {items}),
			nodeSelector = createTreeSelector('node');

		const changesLogPromise = target.evaluate((ctx) => new Promise((resolve) => {
			const
				log: any[] = [],
				onEvent = () => {
					if (log.length >= 4) {
						resolve(log);
					}
				};

			ctx.on('onChange', (value) => {
				log.push(['change', value]);
				onEvent();
			});

			ctx.on('onActionChange', (value) => {
				log.push(['actionChange', value]);
				onEvent();
			});

			log.push(ctx.setActive(0));
		}));

		await page.click(`${nodeSelector}:nth-child(2)`);

		test.expect(await changesLogPromise).toEqual([
			['change', 0],
			true,
			['change', 1],
			['actionChange', 1]
		]);
	});

	test('should watch the changes of `active`', async ({page}) => {
		const
			target = await renderTree(page, {items});

		test.expect(
			await target.evaluate(async (ctx) => {
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
		const
			target = await renderTree(page, {items, attrs: {multiple: true}});

		test.expect(
			await target.evaluate(async (ctx) => {
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
		test('should return id and value of items associated with active nodes', async ({page}) => {
			const target = await renderTree(page, {items, attrs: {active: [0, 1], multiple: true}});
			test.expect(
				await target.evaluate((ctx) => Array.from(ctx.unsafe.traverseActiveNodes()).map(([, ctx]) => ctx))
			).toEqual([
				{id: 0, value: 0},
				{id: 1, value: 1}
			]);
		});
	});

	test.describe('`activeElement`', () => {
		test('should have one active element', async ({page}) => {
			const target = await renderTree(page, {items, attrs: {active: 0}});
			test.expect(await target.evaluate((ctx) => (<HTMLElement>ctx.activeElement).tagName)).toBe('DIV');
		});

		test('should have multiple active elements with `multiple = true`', async ({page}) => {
			const
				target = await renderTree(page, {items, attrs: {active: [0, 1], multiple: true}});

			test.expect(await target.evaluate((ctx) => Array.from(<HTMLElement[]>ctx.activeElement).map((el) => el.tagName)))
				.toEqual(['DIV', 'DIV']);
		});
	});
});
