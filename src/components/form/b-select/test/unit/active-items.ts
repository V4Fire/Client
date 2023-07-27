/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { JSHandle } from 'playwright';

import test from 'tests/config/unit/test';
import { Utils, Assert } from 'tests/helpers';

import type bSelect from 'components/form/b-select/b-select';
import type { Item } from 'components/form/b-select/interface';

import { renderSelect, createSelector } from 'components/form/b-select/test/helpers';

test.describe('<b-select> active items', () => {
	const items: Item[] = [
		{value: 0, label: 'foo'},
		{value: 1, label: 'bar'},
		{value: 2, label: 'baz'},
		{value: 3, label: 'foobar'},
		{value: 4, label: 'foobarbaz'}
	];

	test.beforeEach(async ({demoPage, page}) => {
		await demoPage.goto();
		Assert.setPage(page);
	});

	test.afterEach(() => {
		Assert.unsetPage();
	});

	test.describe('initialize', () => {
		test('should have the `active` item', async ({page}) => {
			const target = await renderSelect(page, {items, active: 0});

			await page.locator(createSelector('input')).focus();

			await test.expect(target.evaluate((ctx) => ctx.active)).toBeResolvedTo(0);
			await test.expect(target.evaluate(async (ctx) => ctx.unsafe.block?.getElementMod(<Element>await ctx.activeElement, 'item', 'selected')))
				.toBeResolvedTo('true');
		});

		test.describe('with `multiple = true`', () => {
			const evaluateActive = (target: JSHandle<bSelect>) => target.evaluate((ctx) => [...<Set<number>>ctx.active]);

			test('`active` prop should accept a scalar value', async ({page}) => {
				const target = await renderSelect(page, {items, active: 0, multiple: true});
				await test.expect(evaluateActive(target)).resolves.toEqual([0]);
			});

			test('`active` prop should accept `Array`', async ({page}) => {
				const target = await renderSelect(page, {items, active: [0, 1], multiple: true});
				await test.expect(evaluateActive(target)).resolves.toEqual([0, 1]);
			});

			test('`active` prop should accept `Iterable`', async ({page}) => {
				const target = await renderSelect(
					page,
					{items, attrs: {active: Utils.evalInBrowser(() => [0, 1].values()), multiple: true}}
				);

				await test.expect(evaluateActive(target)).resolves.toEqual([0, 1]);
			});
		});
	});

	test.describe('`active`', () => {
		test('should be changeable by default', async ({page}) => {
			const
				target = await renderSelect(page, {items, cancelable: true});

			await test.expect(target.evaluate((ctx) => {
				ctx.setActive(1);
				return ctx.active;
			})).toBeResolvedTo(1);

			await test.expect(target.evaluate((ctx) => ctx.unsetActive(1))).resolves.toBeTruthy();
			await test.expect(target.evaluate((ctx) => ctx.active)).resolves.toBeUndefined();

			await test.expect(target.evaluate((ctx) => {
				ctx.toggleActive(1);
				return ctx.active;
			})).toBeResolvedTo(1);
		});

		test('should not be changeable with `cancelable = false`', async ({page}) => {
			const
				target = await renderSelect(page, {items, cancelable: false});

			await test.expect(target.evaluate((ctx) => {
				ctx.setActive(0);
				return ctx.active;
			})).toBeResolvedTo(0);

			await test.expect(target.evaluate((ctx) => {
				ctx.setActive(1);
				return ctx.active;
			})).toBeResolvedTo(1);

			await test.expect(target.evaluate((ctx) => ctx.unsetActive(1))).resolves.toBeFalsy();
			await test.expect(target.evaluate((ctx) => ctx.active)).toBeResolvedTo(1);
		});

		test('should be changeable with `multiple = true`', async ({page}) => {
			const
				target = await renderSelect(page, {items, multiple: true});

			await test.expect(target.evaluate((ctx) => {
				ctx.setActive(1);
				ctx.setActive(0);
				return [...(<Set<number>>ctx.active).keys()];
			})).resolves.toEqual([1, 0]);

			await test.expect(target.evaluate((ctx) => {
				ctx.unsetActive(1);
				ctx.unsetActive(0);
				return [...(<Set<number>>ctx.active).values()];
			})).resolves.toEqual([]);
		});

		test('should not be changeable with `multiple = true; cancelable = false`', async ({page}) => {
			const
				target = await renderSelect(page, {items, multiple: true, cancelable: false});

			await test.expect(target.evaluate((ctx) => {
				ctx.setActive(1);
				ctx.setActive(5);
				return [...(<Set<number>>ctx.active).keys()];
			})).resolves.toEqual([1, 5]);

			await test.expect(target.evaluate((ctx) => {
				ctx.unsetActive(1);
				ctx.unsetActive(5);
				return [...(<Set<number>>ctx.active).values()];
			})).resolves.toEqual([1, 5]);
		});

		test('should be changeable with `multiple = true; cancelable = true`', async ({page}) => {
			const
				target = await renderSelect(page, {items, multiple: true, cancelable: true});

			await test.expect(target.evaluate((ctx) => {
				ctx.setActive(1);
				ctx.setActive(0);
				return [...<Set<number>>ctx.active];
			})).resolves.toEqual([1, 0]);

			await test.expect(target.evaluate((ctx) => {
				ctx.unsetActive(1);
				ctx.unsetActive(0);
				return [...<Set<number>>ctx.active];
			})).resolves.toEqual([]);
		});
	});

	test.describe('`toggleActive`', () => {
		test('should accept scalar value with `multiple = true`', async ({page}) => {
			const
				target = await renderSelect(page, {items, multiple: true}),
				assertItemsAreSelected = Assert.component.itemsHaveMod('selected', true);

			await test.expect(target.evaluate((ctx) => {
				ctx.toggleActive(1);
				ctx.toggleActive(0);
				ctx.toggleActive(1);
				return [...<Set<number>>ctx.active];
			})).resolves.toEqual([0]);

			await page.locator(createSelector('input')).focus();

			await assertItemsAreSelected([0]);
		});

		test('should accept `Iterable` with `multiple = true`', async ({page}) => {
			const
				target = await renderSelect(page, {items, multiple: true}),
				assertItemsSelectedModIs = Assert.component.itemsHaveMod('selected');

			await test.expect(target.evaluate((ctx) => {
				ctx.toggleActive(new Set([0, 1]));
				return [...<Set<number>>ctx.active];
			})).resolves.toEqual([0, 1]);

			await assertItemsSelectedModIs(true, [0, 1]);

			await test.expect(target.evaluate((ctx) => {
				ctx.toggleActive([1, 2].values());
				return [...<Set<number>>ctx.active];
			})).resolves.toEqual([0, 2]);

			await assertItemsSelectedModIs(true, [0, 2]);
			await assertItemsSelectedModIs(false, [1]);
		});

		test('should unset previous active items with `unsetPrevious = true`', async ({page}) => {
			const
				target = await renderSelect(page, {items, multiple: true}),
				assertItemsSelectedModIs = Assert.component.itemsHaveMod('selected');

			await test.expect(target.evaluate((ctx) => {
				ctx.toggleActive(new Set([0, 1]));
				return [...<Set<number>>ctx.active];
			})).resolves.toEqual([0, 1]);

			await assertItemsSelectedModIs(true, [0, 1]);

			await test.expect(target.evaluate((ctx) => {
				ctx.toggleActive([2, 4].values(), true);
				return [...<Set<number>>ctx.active];
			})).resolves.toEqual([2, 4]);

			await assertItemsSelectedModIs(false, [0, 1]);
			await assertItemsSelectedModIs(true, [2, 4]);
		});
	});

	test('should emit change events on click', async ({page}) => {
		const
			target = await renderSelect(page, {items}),
			itemSelector = createSelector('item');

		const scan = target.evaluate((ctx) => new Promise((resolve) => {
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

		await page.locator(createSelector('input')).focus();

		await page.click(`${itemSelector}:nth-child(2)`);

		await test.expect(scan).resolves.toEqual([
			true,
			['change', 0],
			['actionChange', 1],
			['change', 1]
		]);
	});

	test('should watch the changes of `active`', async ({page}) => {
		const
			target = await renderSelect(page, {items});

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
			target = await renderSelect(page, {items, multiple: true});

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

	test.describe('`activeElement`', () => {
		test('should have one active element', async ({page}) => {
			const target = await renderSelect(page, {items, active: 0});

			await page.locator(createSelector('input')).focus();

			test.expect(await target.evaluate((ctx) => (<HTMLElement>ctx.activeElement).tagName)).toBe('SPAN');
		});

		test('should have multiple active elements with `multiple = true`', async ({page}) => {
			const target = await renderSelect(page, {items, active: [0, 1], multiple: true});

			await page.locator(createSelector('input')).focus();

			test.expect(await target.evaluate((ctx) => Array.from(<HTMLElement[]>ctx.activeElement).map((el) => el.tagName)))
				.toEqual(['SPAN', 'SPAN']);
		});
	});
});
