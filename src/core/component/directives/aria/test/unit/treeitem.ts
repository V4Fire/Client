// @ts-check

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

				const res: any[] = [];

				input?.focus();

				input?.dispatchEvent(new KeyboardEvent('keydown', {key: 'ArrowDown', bubbles: true}));
				res.push(document.activeElement?.id === labels[1].getAttribute('for'));

				document.activeElement?.dispatchEvent(new KeyboardEvent('keydown', {key: 'ArrowUp', bubbles: true}));
				res.push(document.activeElement?.id === labels[0].getAttribute('for'));

				document.activeElement?.dispatchEvent(new KeyboardEvent('keydown', {key: 'ArrowDown', bubbles: true}));
				document.activeElement?.dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter', bubbles: true}));
				res.push(items[1].getAttribute('aria-expanded'));

				document.activeElement?.dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter', bubbles: true}));
				res.push(items[1].getAttribute('aria-expanded'));

				document.activeElement?.dispatchEvent(new KeyboardEvent('keydown', {key: 'ArrowRight', bubbles: true}));
				res.push(items[1].getAttribute('aria-expanded'));

				document.activeElement?.dispatchEvent(new KeyboardEvent('keydown', {key: 'ArrowRight', bubbles: true}));
				res.push(document.activeElement?.id === labels[2].getAttribute('for'));

				document.activeElement?.dispatchEvent(new KeyboardEvent('keydown', {key: 'ArrowLeft', bubbles: true}));
				res.push(document.activeElement?.id === labels[1].getAttribute('for'));

				document.activeElement?.dispatchEvent(new KeyboardEvent('keydown', {key: 'ArrowLeft', bubbles: true}));
				res.push(items[1].getAttribute('aria-expanded'));

				document.activeElement?.dispatchEvent(new KeyboardEvent('keydown', {key: 'Home', bubbles: true}));
				res.push(document.activeElement?.id === labels[0].getAttribute('for'));

				document.activeElement?.dispatchEvent(new KeyboardEvent('keydown', {key: 'End', bubbles: true}));
				res.push(document.activeElement?.id === labels[3].getAttribute('for'));

				return res;
			})
		).toEqual([true, true, 'true', 'false', 'true', true, true, 'false', true, true]);
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

				const res: any[] = [];

				input?.focus();

				input?.dispatchEvent(new KeyboardEvent('keydown', {key: 'ArrowRight', bubbles: true}));
				res.push(document.activeElement?.id === labels[1].getAttribute('for'));

				document.activeElement?.dispatchEvent(new KeyboardEvent('keydown', {key: 'ArrowLeft', bubbles: true}));
				res.push(document.activeElement?.id === labels[0].getAttribute('for'));

				document.activeElement?.dispatchEvent(new KeyboardEvent('keydown', {key: 'ArrowRight', bubbles: true}));
				document.activeElement?.dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter', bubbles: true}));
				res.push(items[1].getAttribute('aria-expanded'));

				document.activeElement?.dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter', bubbles: true}));
				res.push(items[1].getAttribute('aria-expanded'));

				document.activeElement?.dispatchEvent(new KeyboardEvent('keydown', {key: 'ArrowDown', bubbles: true}));
				res.push(items[1].getAttribute('aria-expanded'));

				document.activeElement?.dispatchEvent(new KeyboardEvent('keydown', {key: 'ArrowDown', bubbles: true}));
				res.push(document.activeElement?.id === labels[2].getAttribute('for'));

				document.activeElement?.dispatchEvent(new KeyboardEvent('keydown', {key: 'ArrowUp', bubbles: true}));
				res.push(document.activeElement?.id === labels[1].getAttribute('for'));

				document.activeElement?.dispatchEvent(new KeyboardEvent('keydown', {key: 'ArrowUp', bubbles: true}));
				res.push(items[1].getAttribute('aria-expanded'));

				document.activeElement?.dispatchEvent(new KeyboardEvent('keydown', {key: 'Home', bubbles: true}));
				res.push(document.activeElement?.id === labels[0].getAttribute('for'));

				document.activeElement?.dispatchEvent(new KeyboardEvent('keydown', {key: 'End', bubbles: true}));
				res.push(document.activeElement?.id === labels[3].getAttribute('for'));

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
