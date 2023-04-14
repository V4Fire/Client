/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { BrowserContext, ElementHandle, JSHandle, Page } from 'playwright';

import test from 'tests/config/unit/test';

import DOM from 'tests/helpers/dom';

import type bTree from 'components/base/b-tree/b-tree';
import type { Item } from 'components/base/b-tree/interface';

interface CheckOptionTreeCtx {
	target: JSHandle<bTree>;
	queue?:Array<Promise<void>>;
	level?: number;
	foldSelector?: string;
}

/**
 * Returns `folded` class modifier for given value
 *
 * @param target
 * @param value
 */
export function getFoldedClass(target: JSHandle<bTree>, value: boolean = true): Promise<string> {
	return target.evaluate(
		(ctx, v) => ctx.unsafe.block!.getFullElementName('node', 'folded', v),
		value
	);
}

/**
 * Iterates over all tree items depth-first and unfolds closed items by clicking them.
 * Also it checks that all items have correct `data-level` attribute and `folded` class modifier.
 *
 * @param page
 * @param items
 * @param param2
 */
export function checkOptionTree(
	page: Page,
	items: Item[],
	{target, queue = [], level = 0, foldSelector}: CheckOptionTreeCtx
): Array<Promise<void>> {
	items.forEach((item) => {
		const isBranch = Object.isArray(item.children);

		const promise = (async () => {
			const
				id = await target.evaluate((ctx, value) => `${ctx.valueIndexes.get(value)}`, item.value),
				elementSelector = `[data-id$="-${id}"]`,
				element = await page.waitForSelector(elementSelector, {state: 'attached'});

			const
				isFolded = item.folded ?? await target.evaluate((ctx) => ctx.folded),
				foldedClass = await getFoldedClass(
					target,
					isFolded
				);

			await test.expect(element.getAttribute('data-level')).toBeResolvedTo(String(level));

			if (isBranch) {
				const
					selector = foldSelector ?? DOM.elNameSelectorGenerator('b-tree', 'fold'),
					fold = await element.waitForSelector(selector, {state: 'attached'});

				await test.expect(page.locator(elementSelector)).toHaveClass(new RegExp(foldedClass));

				if (isFolded) {
					await fold.click();
				}
			}
		})();

		queue.push(promise);

		if (isBranch) {
			checkOptionTree(page, item.children ?? [], {
				level: level + 1,
				target,
				queue,
				foldSelector
			});
		}
	});

	return queue;
}

/**
 * Returns tree item element handle for the id
 *
 * @param page
 * @param target
 * @param value
 */
export async function waitForItem(
	page: Page,
	target: JSHandle<bTree>,
	value: string | number
): Promise<ElementHandle<HTMLElement | SVGElement>> {
	const id = await target.evaluate((ctx, value) => ctx.valueIndexes.get(value), value.toString());
	return page.waitForSelector(`[data-id$="-${id}"]`, {state: 'attached'});
}

/**
* Provides an API to intercept and mock response for the b-tree request.
* @param pageOrContext
*/
export function interceptTreeRequest(
	pageOrContext: Page | BrowserContext
): Promise<void> {
	return pageOrContext.route(/api/, async (route) => route.fulfill({
		status: 200,
		contentType: 'application/json',
		body: JSON.stringify([
			{value: 'foo_0_0'},
			{
				value: 'foo_0_1',
				children: [
					{value: 'foo_1_0'},
					{value: 'foo_1_1'},

					{
						value: 'foo_1_2',
						children: [{value: 'foo_2_0'}]
					},

					{value: 'foo_1_3'},
					{value: 'foo_1_4'},
					{value: 'foo_1_5'}
				]
			},
			{value: 'foo_0_2'},
			{value: 'foo_0_3'},
			{value: 'foo_0_4'},
			{value: 'foo_0_5'},
			{value: 'foo_0_6'}
		])
	}));
}
