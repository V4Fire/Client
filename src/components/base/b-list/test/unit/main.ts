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

import type bList from 'components/base/b-list/b-list';
import { renderList, createListSelector } from 'components/base/b-list/test/helpers';

test.describe('<b-list>', () => {
	test.beforeEach(async ({demoPage}) => {
		await demoPage.goto();
	});

	test.describe('initialization', () => {
		test('should have `items`', async ({page}) => {
			const
				target = await renderList(page),
				linkSelector = createListSelector('link');

			const itemsPromise = target.evaluate(
				(ctx) => Array.from(ctx.unsafe.block!.elements('item')).map((el) => el.textContent?.trim())
			);

			test.expect(await itemsPromise).toEqual(['Foo', 'Bla']);
			test.expect(await target.evaluate((ctx) => ctx.active)).toBeUndefined();

			await test.expect(page.locator(linkSelector).first()).toHaveAttribute('title', 'Custom attr');
		});

		test('should have `active` item', async ({page}) => {
			const target = await renderList(page, {active: 0});
			test.expect(await target.evaluate((ctx) => ctx.active)).toBe(0);
		});

		test.describe('with `multiple = true`', () => {
			const evaluateActive = (target: JSHandle<bList>) => target.evaluate((ctx) => [...<Set<number>>ctx.active]);

			test('`active` prop should accept scalar value', async ({page}) => {
				const target = await renderList(page, {active: 0, multiple: true});
				test.expect(await evaluateActive(target)).toEqual([0]);
			});

			test('`active` prop should accept `Array`', async ({page}) => {
				const target = await renderList(page, {active: [0, 1], multiple: true});
				test.expect(await evaluateActive(target)).toEqual([0, 1]);
			});

			test('`active` prop should accept `Iterable`', async ({page}) => {
				const
					active = Utils.evalInBrowser(() => [0, 1].values()),
					target = await renderList(page, {active, multiple: true});

				test.expect(await evaluateActive(target)).toEqual([0, 1]);
			});
		});
	});

	test('should change items via assignment', async ({page}) => {
		const target = await renderList(page);

		const changesLogPromise = target.evaluate(async (ctx) => {
			const log: any[] = [];

			ctx.on('onItemsChange', (val) => {
				log.push(Object.fastClone(val));
			});

			ctx.items = [{label: 'Bar', value: []}];

			log.push(Object.fastClone(ctx.items));

			await ctx.nextTick();

			return log;
		});

		test.expect(await changesLogPromise).toEqual([
			[{label: 'Bar', value: []}],
			[{label: 'Bar', value: []}]
		]);
	});

	test.describe('`active`', () => {
		test('should be changeable', async ({page}) => {
			const target = await renderList(page);

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
				target = await renderList(page, {cancelable: true});

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
				target = await renderList(page, {multiple: true});

			test.expect(
				await target.evaluate((ctx) => {
					ctx.setActive(1);
					ctx.setActive(0);
					return [...(<Set<number>>ctx.active).values()];
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
				target = await renderList(page, {multiple: true, cancelable: false});

			test.expect(
				await target.evaluate((ctx) => {
					ctx.setActive(1);
					ctx.setActive(0);
					return [...(<Set<number>>ctx.active).values()];
				})

			).toEqual([1, 0]);

			test.expect(
				await target.evaluate((ctx) => {
					ctx.unsetActive(1);
					ctx.unsetActive(0);
					return [...(<Set<number>>ctx.active).values()];
				})

			).toEqual([1, 0]);
		});
	});

	test.describe('`activeElement`', () => {
		test('should have one active element', async ({page}) => {
			const target = await renderList(page, {active: 0});
			test.expect(await target.evaluate((ctx) => (<HTMLAnchorElement>ctx.activeElement).tagName))
				.toBe('BUTTON');
		});

		test('should have multiple active elements with `multiple = true`', async ({page}) => {
			const
				target = await renderList(page, {active: [0, 1], multiple: true});

			test.expect(await target.evaluate(
				(ctx) => Array.from(<HTMLAnchorElement[]>ctx.activeElement).map((el) => el.tagName)
			))
				.toEqual(['BUTTON', 'BUTTON']);
		});
	});

	test('should emit change events on click', async ({page}) => {
		const
			target = await renderList(page),
			itemSelector = createListSelector('item'),
			linkSelector = createListSelector('link');

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

		await page.click(`${itemSelector}:nth-child(2) ${linkSelector}`);

		await test.expect(scan).resolves.toEqual([
			true,
			['change', 0],
			['actionChange', 1],
			['change', 1]
		]);
	});

	test('should watch the changes of `active`', async ({page}) => {
		const
			target = await renderList(page);

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
			target = await renderList(page, {multiple: true});

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

	test('should remove focus from previous active element', async ({page}) => {
		const
			target = await renderList(page);

		const links = await page.locator(`${createListSelector('link')}`);

		await links.first().click();
		await test.expect(links.first()).toBeFocused();

		await target.evaluate((ctx) => ctx.setActive(1));
		await test.expect(() => test.expect(links.first()).not.toBeFocused()).toPass();
	});
});
