/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import test from 'tests/config/unit/test';

import Utils from 'tests/helpers/utils';

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
		{value: 5, label: '5'}
	];

	test.beforeEach(async ({demoPage}) => {
		await demoPage.goto();
	});

	test('initialization with the predefined active element', async ({page}) => {

		const target = await renderTree(page, {items, attrs: {active: 0}});
		test.expect(await target.evaluate((ctx) => ctx.active)).toBe(0);

		test.expect(
			await target.evaluate(async (ctx) => ctx.unsafe.block?.getElementMod(<Element>await ctx.activeElement, 'node', 'active'))
		).toBe('true');
	});

	test('initialization with the predefined active element (primitive) with `multiple = true`', async ({page}) => {
		const target = await renderTree(page, {items, attrs: {active: 0, multiple: true}});
		test.expect(await target.evaluate((ctx) => [...<Set<number>>ctx.active])).toEqual([0]);
	});

	test('initialization with the predefined active element (array) with `multiple = true`', async ({page}) => {
		const target = await renderTree(page, {items, attrs: {active: [0, 1], multiple: true}});
		test.expect(await target.evaluate((ctx) => [...<Set<number>>ctx.active])).toEqual([0, 1]);
	});

	test('initialization with the predefined active element (set) with `multiple = true`', async ({page}) => {
		const target = await renderTree(
			page,
			{items, attrs: {active: Utils.evalInBrowser(() => new Set([0, 1])), multiple: true}}
		);
		test.expect(await target.evaluate((ctx) => [...<Set<number>>ctx.active])).toEqual([0, 1]);
	});

	test.describe('switching of an active element', () => {
		test('default', async ({page}) => {
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

		test('with `cancelable = true`', async ({page}) => {
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

		test('with `multiple = true`', async ({page}) => {
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

		test('with `multiple = true; cancelable = false`', async ({page}) => {
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

		test('with `multiple = true; cancelable = true`', async ({page}) => {
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

		test('and unfold parents folds', async ({page}) => {
			const
				target = await renderTree(page, {items});

			await target.evaluate((ctx) => ctx.setActive(4));

			const nodes = await waitForItems(page, target, [2, 3]);

			await testFoldedModIs(false, nodes);
		});

		test('with `toggleActive` and unfold parents folds', async ({page}) => {
			const
				target = await renderTree(page, {items});

			await target.evaluate((ctx) => ctx.toggleActive(4));

			const nodes = await waitForItems(page, target, [2, 3]);

			await testFoldedModIs(false, nodes);
		});

		test('with `toggleActive` with primitive value', async ({page}) => {
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

		test('with `toggleActive` with `Set`', async ({page}) => {
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
					ctx.toggleActive(new Set([1, 3]));
					return [...<Set<number>>ctx.active];
				})
			).toEqual([0, 3]);

			const
				activeNodes = await waitForItems(page, target, [0, 3]),
				inactiveNodes = await waitForItems(page, target, [1]);

			await testActiveModIs(true, activeNodes);
			await testActiveModIs(false, inactiveNodes);

		});

		test('with `toggleActive` with `Set` with unsetPrevious', async ({page}) => {
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
					ctx.toggleActive(new Set([2, 4]), true);
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
					if (log.length >= 6) {
						resolve(log);
					}
				};

			ctx.on('immediateChange', (component, value) => {
				log.push(['immediateChange', value]);
				onEvent();
			});

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
			['immediateChange', 0],
			['change', 0],
			true,
			['immediateChange', 1],
			['change', 1],
			['actionChange', 1]
		]);
	});

	test('watching for `active`', async ({page}) => {
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

	test('watching for `active` with `multiple = true`', async ({page}) => {
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

	test('checking of `activeElement`', async ({page}) => {
		const target = await renderTree(page, {items, attrs: {active: 0}});
		test.expect(await target.evaluate((ctx) => (<HTMLElement>ctx.activeElement).tagName)).toBe('DIV');
	});

	test('checking of `activeElement` with `multiple = true`', async ({page}) => {
		const
			target = await renderTree(page, {items, attrs: {active: [0, 1], multiple: true}});

		test.expect(await target.evaluate((ctx) => Array.from(<HTMLElement[]>ctx.activeElement).map((el) => el.tagName)))
			.toEqual(['DIV', 'DIV']);
	});
});
