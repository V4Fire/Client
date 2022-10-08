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

test.describe('v-aria:tab', () => {
	test.beforeEach(async ({demoPage}) => {
		await demoPage.goto();
	});

	const
		selector = '[data-id="target"]';

	test('list items must have the `role` attributes', async ({page}) => {
		const target = await init(page);

		test.expect(
			await target.evaluate((ctx) => {
				if (ctx.unsafe.block == null) {
					return;
				}

				const tabs = ctx.unsafe.block.elements('link');

				const res: Array<Nullable<string>> = [];

				tabs.forEach((el) => res.push(el.getAttribute('role')));

				return res;
			})
		).toEqual(['tab', 'tab', 'tab']);
	});

	test('list items must have the `aria-controls` attributes', async ({page}) => {
		const target = await init(page);

		test.expect(
			await target.evaluate((ctx) => {
				if (ctx.unsafe.block == null) {
					return;
				}

				const tabs = ctx.unsafe.block.elements('link');

				const res: Array<Nullable<string>> = [];

				tabs.forEach((el) => res.push(el.getAttribute('aria-controls')));

				return res;
			})
		).toEqual(['id4', 'id5', 'id6']);
	});

	test('the active element must have the `aria-selected` attribute', async ({page}) => {
		const target = await init(page, {active: 1});

		await page.focus(selector);

		test.expect(
			await target.evaluate((ctx) => {
				if (ctx.unsafe.block == null) {
					return;
				}

				const tabs = ctx.unsafe.block.elements('link');

				const res: Array<Nullable<string>> = [];

				tabs.forEach((el) => res.push(el.getAttribute('aria-selected')));

				return res;
			})
		).toEqual(['false', 'true', 'false']);
	});

	test('if there is no active element, then all elements except the first must have the `tabindex` attribute equal to `-1`', async ({page}) => {
		const target = await init(page);

		test.expect(
			await target.evaluate((ctx) => {
				if (ctx.unsafe.block == null) {
					return;
				}

				const tabs: NodeListOf<HTMLElement> = ctx.unsafe.block.elements('link');

				const res: number[] = [];

				tabs.forEach((el) => res.push(el.tabIndex));

				return res;
			})
		).toEqual([0, -1, -1]);
	});

	test('all elements except the active must have the `tabindex` attribute equal to `-1`', async ({page}) => {
		const target = await init(page, {active: 1});

		test.expect(
			await target.evaluate((ctx) => {
				if (ctx.unsafe.block == null) {
					return;
				}

				const tabs: NodeListOf<HTMLElement> = ctx.unsafe.block.elements('link');

				const res: number[] = [];

				tabs.forEach((el) => res.push(el.tabIndex));

				return res;
			})
		).toEqual([-1, 0, -1]);
	});

	test('changing the active element', async ({page}) => {
		const target = await init(page);

		test.expect(
			await target.evaluate((ctx) => {
				if (ctx.unsafe.block == null) {
					return;
				}

				let tabs: NodeListOf<HTMLElement> = ctx.unsafe.block.elements('link');

				tabs[1].click();

				const res: Array<[number, Nullable<string>]> = [];

				tabs = ctx.unsafe.block.elements('link');

				tabs.forEach((el, i) => res[i] = [el.tabIndex, el.ariaSelected]);

				return res;
			})
		).toEqual([
			[-1, 'false'],
			[0, 'true'],
			[-1, 'false']
		]);
	});

	test('keyboard support with the horizontal orientation', async ({page}) => {
		const target = await init(page);

		test.expect(
			await target.evaluate((ctx) => {
				if (ctx.unsafe.block == null) {
					return;
				}

				const
					res: Array<CanUndef<string>> = [],
					tab: CanUndef<HTMLElement> = ctx.unsafe.block.element('link');

				tab?.focus();
				tab?.dispatchEvent(new KeyboardEvent('keydown', {key: 'ArrowRight'}));
				res.push(document.activeElement?.id);

				document.activeElement?.dispatchEvent(new KeyboardEvent('keydown', {key: 'ArrowLeft'}));
				res.push(document.activeElement?.id);

				document.activeElement?.dispatchEvent(new KeyboardEvent('keydown', {key: 'ArrowUp'}));
				res.push(document.activeElement?.id);

				document.activeElement?.dispatchEvent(new KeyboardEvent('keydown', {key: 'ArrowDown'}));
				res.push(document.activeElement?.id);

				document.activeElement?.dispatchEvent(new KeyboardEvent('keydown', {key: 'End'}));
				res.push(document.activeElement?.id);

				document.activeElement?.dispatchEvent(new KeyboardEvent('keydown', {key: 'Home'}));
				res.push(document.activeElement?.id);

				return res;
			})
		).toEqual(['id2', 'id1', 'id1', 'id1', 'id3', 'id1']);
	});

	test('keyboard support with the vertical orientation', async ({page}) => {
		const target = await init(page, {orientation: 'vertical'});

		test.expect(
			await target.evaluate((ctx) => {
				if (ctx.unsafe.block == null) {
					return;
				}

				const
					res: Array<CanUndef<string>> = [],
					tab: CanUndef<HTMLElement> = ctx.unsafe.block.element('link');

				tab?.focus();
				tab?.dispatchEvent(new KeyboardEvent('keydown', {key: 'ArrowRight'}));
				res.push(document.activeElement?.id);

				document.activeElement?.dispatchEvent(new KeyboardEvent('keydown', {key: 'ArrowLeft'}));
				res.push(document.activeElement?.id);

				document.activeElement?.dispatchEvent(new KeyboardEvent('keydown', {key: 'ArrowDown'}));
				res.push(document.activeElement?.id);

				document.activeElement?.dispatchEvent(new KeyboardEvent('keydown', {key: 'ArrowUp'}));
				res.push(document.activeElement?.id);

				document.activeElement?.dispatchEvent(new KeyboardEvent('keydown', {key: 'End'}));
				res.push(document.activeElement?.id);

				document.activeElement?.dispatchEvent(new KeyboardEvent('keydown', {key: 'Home'}));
				res.push(document.activeElement?.id);

				return res;
			})
		).toEqual(['id1', 'id1', 'id2', 'id1', 'id3', 'id1']);
	});

	/**
	 * @param page
	 * @param attrs
	 */
	async function init(page: Page, attrs: Dictionary = {}): Promise<JSHandle<iBlock>> {
		return Component.createComponent(page, 'b-list', {
			attrs: {
				'data-id': 'target',

				items: [
					{id: 'id1', label: 'Male', value: 0, controls: 'id4'},
					{id: 'id2', label: 'Female', value: 1, controls: 'id5'},
					{id: 'id3', label: 'Other', value: 2, controls: 'id6'}
				],

				...attrs
			}
		});
	}
});

