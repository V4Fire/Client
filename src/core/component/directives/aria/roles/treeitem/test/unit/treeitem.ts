/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { JSHandle, Page } from 'playwright';
import type iBlock from 'super/i-block/i-block';

import test from 'tests/config/unit/test';
import Component from 'tests/helpers/component';

test.describe('v-aria:treeitem', () => {
	test.beforeEach(async ({demoPage}) => {
		await demoPage.goto();
	});

	test('role is set', async ({page}) => {
		const target = await init(page);

		test.expect(
			await target.evaluate((ctx) => {
				const el = ctx.unsafe.block?.element('node');

				return el?.getAttribute('role');
			})
		).toBe('treeitem');
	});

	test('aria-expanded is set', async ({page}) => {
		const target = await init(page);

		await page.waitForSelector('[role="group"]');

		test.expect(
			await target.evaluate((ctx) => {
				const
					items = ctx.unsafe.block?.elements('node'),
					expandableItem = items?.[1];

				return expandableItem?.getAttribute('aria-expanded');
			})
		).toBe('false');
	});

	test('keyboard keys handle on vertical orientation', async ({page}) => {
		const target = await init(page);

		test.expect(
			await target.evaluate((ctx) => {
				if (ctx.unsafe.block == null) {
					return;
				}

				const
					input = document.querySelector('input'),
					items = ctx.unsafe.block.elements('node'),
					labels = document.querySelectorAll('label');

				const
					res: Array<Nullable<boolean | string>> = [];

				const
					eq = (index: number) => document.activeElement?.id === labels[index].getAttribute('for'),
					att = (): Nullable<string> => items[1].getAttribute('aria-expanded'),
					dis = (key: string) => document.activeElement?.dispatchEvent(
							new KeyboardEvent('keydown', {key, bubbles: true})
						);

				input?.focus();

				input?.dispatchEvent(new KeyboardEvent('keydown', {key: 'ArrowDown', bubbles: true}));
				res.push(eq(1));

				dis('ArrowUp');
				res.push(eq(0));
				dis('Enter');
				res.push(items[0].getAttribute('aria-expanded'));

				dis('ArrowDown');
				dis('Enter');
				res.push(att());

				dis('Enter');
				res.push(att());

				dis('ArrowRight');
				res.push(att());

				dis('ArrowRight');
				res.push(eq(2));

				dis('ArrowLeft');
				res.push(eq(1));

				dis('ArrowLeft');
				res.push(att());

				dis('Home');
				res.push(eq(0));

				dis('End');
				res.push(eq(3));

				return res;
			})
		).toEqual([true, true, null, 'true', 'false', 'true', true, true, 'false', true, true]);
	});

	test('keyboard keys handle on horizontal orientation', async ({page}) => {
		const target = await init(page, {orientation: 'horizontal'});

		await page.waitForSelector('[role="group"]');

		test.expect(
			await target.evaluate((ctx) => {
				if (ctx.unsafe.block == null) {
					return;
				}

				const
					input = document.querySelector('input'),
					items = ctx.unsafe.block.elements('node'),
					labels = document.querySelectorAll('label');

				const
					res: Array<Nullable<boolean | string>> = [];

				const
					eq = (index: number) => document.activeElement?.id === labels[index].getAttribute('for'),
					att = (): Nullable<string> => items[1].getAttribute('aria-expanded'),
					dis = (key: string) => document.activeElement?.dispatchEvent(
						new KeyboardEvent('keydown', {key, bubbles: true})
					);

				input?.focus();

				input?.dispatchEvent(new KeyboardEvent('keydown', {key: 'ArrowRight', bubbles: true}));
				res.push(eq(1));

				dis('ArrowLeft');
				res.push(eq(0));

				dis('ArrowRight');
				dis('Enter');
				res.push(att());

				dis('Enter');
				res.push(att());

				dis('ArrowDown');
				res.push(att());

				dis('ArrowDown');
				res.push(eq(2));

				dis('ArrowUp');
				res.push(eq(1));

				dis('ArrowUp');
				res.push(att());

				dis('Home');
				res.push(eq(0));

				dis('End');
				res.push(eq(3));

				return res;
			})
		).toEqual([true, true, 'true', 'false', 'true', true, true, 'false', true, true]);
	});

	/**
	 * @param page
	 * @param attrs
	 */
	async function init(page: Page, attrs: Dictionary = {}): Promise<JSHandle<iBlock>> {
		return Component.createComponent(page, 'b-tree', {
			attrs: {
				item: 'b-checkbox',
				items: [
					{id: 'bar', label: 'bar'},
					{
						id: 'foo',
						label: 'foo',
						children: [{id: 'fooone', label: 'foo1'}]
					},
					{id: 'bla', label: 'bla'}
				],
				...attrs
			}
		});
	}
});
