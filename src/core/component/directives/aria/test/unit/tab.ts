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

test.describe('v-aria:tab', () => {
	test.beforeEach(async ({demoPage}) => {
		await demoPage.goto();
	});

	const
		selector = '[data-id="target"]';

	test('role is set', async ({page}) => {
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

	test('has active value', async ({page}) => {
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

	test('tabindexes are set without active item', async ({page}) => {
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

	test('tabindexes are set with active item', async ({page}) => {
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

	test('active item changed', async ({page}) => {
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

	test('keyboard keys handle on horizontal orientation', async ({page}) => {
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

	test('keyboard keys handle on vertical orientation', async ({page}) => {
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
					{label: 'Male', value: 0, attrs: {id: 'id1'}},
					{label: 'Female', value: 1, attrs: {id: 'id2'}},
					{label: 'Other', value: 2, attrs: {id: 'id3'}}
				],
				...attrs
			}
		});
	}
});

