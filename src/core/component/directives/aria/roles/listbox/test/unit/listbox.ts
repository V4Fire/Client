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

test.describe('v-aria:listbox', () => {
	test.beforeEach(async ({demoPage}) => {
		await demoPage.goto();
	});

	const
		selector = '[data-id="target"]';

	test('role is set', async ({page}) => {
		const target = await init(page);

		await page.click(selector);

		test.expect(
			await target.evaluate((ctx) => {
				const el = ctx.unsafe.block?.element('wrapper');

				return el?.getAttribute('role');
			})
		).toBe('listbox');
	});

	test('tabindex is -1', async ({page}) => {
		const target = await init(page, {}, 'b-select');

		await page.click(selector);

		test.expect(
			await target.evaluate((ctx) => {
				const el = ctx.unsafe.block?.element('dropdown');

				return el?.getAttribute('tabindex');
			})
		).toBe('-1');
	});

	test.describe('stand alone listbox', () => {

		test('tabindex is 0', async ({page}) => {
			const target = await init(page, {standAlone: true, label: 'foo'});

			await page.click(selector);

			test.expect(
				await target.evaluate((ctx) => {
					const el = ctx.unsafe.block?.element('wrapper');

					return el?.getAttribute('tabindex');
				})
			).toBe('0');
		});

		test('item is selected and unselected', async ({page}) => {
			const target = await init(page, {standAlone: true, label: 'foo'});

			test.expect(
				await target.evaluate((ctx) => {
					const list = <AccessibleElement>ctx.unsafe.block?.element('wrapper');

					list.focus();
					list.dispatchEvent(new KeyboardEvent('keydown', {key: 'ArrowDown'}));

					const el = ctx.unsafe.block?.element('wrapper');

					return el?.getAttribute('aria-activedescendant');
				})
			).toBe('id1');

			test.expect(
				await target.evaluate((ctx) => {
					const el = ctx.unsafe.block?.element('item');

					document.activeElement?.dispatchEvent(new KeyboardEvent('keydown', {key: ' '}));

					return el?.getAttribute('aria-selected');
				})
			).toBe('true');

			test.expect(
				await target.evaluate((ctx) => {
					const el = ctx.unsafe.block?.element('item');

					document.activeElement?.dispatchEvent(new KeyboardEvent('keydown', {key: ' '}));

					return el?.getAttribute('aria-selected');
				})
			).toBe('false');
		});

		test('item is selected and unselected with multiple mod', async ({page}) => {
			const target = await init(page, {standAlone: true, label: 'foo', multiple: true});

			test.expect(
				await target.evaluate((ctx) => {
					const list = <AccessibleElement>ctx.unsafe.block?.element('wrapper');

					list.focus();
					list.dispatchEvent(new KeyboardEvent('keydown', {key: 'ArrowDown'}));
					document.activeElement?.dispatchEvent(new KeyboardEvent('keydown', {key: ' '}));

					return document.activeElement?.getAttribute('aria-selected');
				})
			).toBe('true');

			test.expect(
				await target.evaluate((ctx) => {
					const list = <AccessibleElement>ctx.unsafe.block?.element('wrapper');

					return list.getAttribute('aria-activedescendant');
				})
			).toBe('id1');

			test.expect(
				await target.evaluate((ctx) => {
					const list = <AccessibleElement>ctx.unsafe.block?.element('wrapper');
					list.dispatchEvent(new KeyboardEvent('keydown', {key: 'ArrowDown'}));

					document.activeElement?.dispatchEvent(new KeyboardEvent('keydown', {key: ' '}));

					return document.activeElement?.getAttribute('aria-selected');
				})
			).toBe('true');

			test.expect(
				await target.evaluate((ctx) => {
					const list = <AccessibleElement>ctx.unsafe.block?.element('wrapper');

					return list.getAttribute('aria-activedescendant');
				})
			).toBe('id2');

			test.expect(
				await target.evaluate(() => {
					document.activeElement?.dispatchEvent(new KeyboardEvent('keydown', {key: ' '}));

					return document.activeElement?.getAttribute('aria-selected');
				})
			).toBe('false');
		});

		test('keyboard support with the vertical orientation', async ({page}) => {
			const target = await init(page, {standAlone: true, label: 'foo'});

			test.expect(
				await target.evaluate((ctx) => {
					const
						list = <AccessibleElement>ctx.unsafe.block?.element('wrapper'),
						res: Array<CanUndef<string>> = [];

					const dis = (key) => {
						document.activeElement?.dispatchEvent(new KeyboardEvent('keydown', {key, bubbles: true}));
						res.push(document.activeElement?.id);
					};

					list.focus();
					list.dispatchEvent(new KeyboardEvent('keydown', {key: 'End'}));

					res.push(document.activeElement?.id);

					dis('Home');

					dis('ArrowDown');

					dis('ArrowUp');

					dis('ArrowLeft');

					dis('ArrowRight');

					return res;
				})
			).toEqual(['id3', 'id1', 'id2', 'id1', 'id1', 'id1']);
		});

		test('keyboard support with the horizontal orientation', async ({page}) => {
			const target = await init(page, {standAlone: true, label: 'foo', orientation: 'horizontal'});

			test.expect(
				await target.evaluate((ctx) => {
					const
						list = <AccessibleElement>ctx.unsafe.block?.element('wrapper'),
						res: Array<CanUndef<string>> = [];

					const dis = (key) => {
						document.activeElement?.dispatchEvent(new KeyboardEvent('keydown', {key, bubbles: true}));
						res.push(document.activeElement?.id);
					};

					list.focus();
					list.dispatchEvent(new KeyboardEvent('keydown', {key: 'End'}));

					res.push(document.activeElement?.id);

					dis('Home');

					dis('ArrowRight');

					dis('ArrowLeft');

					dis('ArrowDown');

					dis('ArrowUp');

					return res;
				})
			).toEqual(['id3', 'id1', 'id2', 'id1', 'id1', 'id1']);
		});
	});

	/**
	 * @param page
	 * @param attrs
	 * @param component
	 */
	async function init(
		page: Page,
		attrs: Dictionary = {},
		component: string = 'b-dummy-listbox'
	): Promise<JSHandle<iBlock>> {
		return Component.createComponent(page, component, {
			attrs: {
				'data-id': 'target',
				items: [
					{value: 1, label: 'item1', id: 'id1'},
					{value: 2, label: 'item2', id: 'id2'},
					{value: 3, label: 'item3', id: 'id3'}
				],
				...attrs
			}
		});
	}
});
