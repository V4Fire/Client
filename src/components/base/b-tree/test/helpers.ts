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
import Component from 'tests/helpers/component';

import type bTree from 'components/base/b-tree/b-tree';
import type { Item } from 'components/base/b-tree/interface';

export function getItemsCount(items: Item[]) {
	let count = 0;

	items.forEach(({children}) => {
		count++;

		if (children != null) {
			count += getItemsCount(children);
		}
	});

	return count;
}

export function getRenderedNodesCount(tree: JSHandle<bTree>) {
	return tree.evaluate((ctx) => {
		const nodes = ctx.$el!.querySelectorAll(`.${ctx.provide.fullElementName('node')}`);
		return nodes.length;
	});
}

export function waitForNumberOfNodes(tree: JSHandle<bTree>, number: number) {
	return tree.evaluate(({unsafe}, number) => unsafe.async.wait(() => {
		const nodes = unsafe.$el!.querySelectorAll(`.${unsafe.provide.fullElementName('node')}`);
		return nodes.length === number;
	}), number);
}

export function sleep(ms: number) {
	return new Promise((res) => setTimeout(() => res(true), ms));
}

interface CheckOptionTreeCtx {
	target: JSHandle<bTree>;
	queue?:Array<Promise<void>>;
	level?: number;
	foldSelector?: string;
}

/**
 * Returns the rendered bTree component
 *
 * @param page
 * @param opts
 */
export async function renderTree(
	page: Page,
	opts: Partial<{items: Item[]} & RenderComponentsVnodeParams> = {}
): Promise<JSHandle<bTree>> {
	const {
		items,
		attrs,
		children
	} = opts;

	return Component.createComponent(page, 'b-tree', {
		attrs: {
			items,
			id: 'target',
			theme: 'demo',
			...attrs
		},

		children: children ?? {default: ({item}) => item.label}
	});
}

/**
 * Returns the `folded` class modifier for the given value
 *
 * @param target
 * @param value
 */
export function getFoldedClass(target: JSHandle<bTree>, value: boolean = true): Promise<string> {
	return target.evaluate(
		(ctx, v) => ctx.unsafe.provide.fullElementName('node', 'folded', v),
		value
	);
}

/**
 * Iterates over all tree items depth-first and unfolds closed items by clicking them.
 * Also, it checks that all items have the correct `data-level` attribute and `folded` class modifier.
 *
 * @param page
 * @param items
 * @param params
 */
export function checkOptionTree(
	page: Page,
	items: Item[],
	{target, queue = [], level = 0, foldSelector}: CheckOptionTreeCtx
): Array<Promise<void>> {
	items.forEach((item) => {
		const isBranch = Object.isArray(item.children);

		const promise = (async () => {
			const itemId = String(
				await target.evaluate((ctx, value) => ctx.unsafe.values.getIndex(value), item.value)
			);

			const
				isFolded = item.folded ?? await target.evaluate((ctx) => ctx.folded),
				foldedClass = await getFoldedClass(target, isFolded);

			const
				itemSelector = `[data-id="${itemId}"]`,
				itemElement = await page.waitForSelector(itemSelector, {state: 'attached'});

			await test.expect(itemElement.getAttribute('data-level')).toBeResolvedTo(String(level));

			if (isBranch) {
				const
					selector = foldSelector ?? DOM.elNameSelectorGenerator('b-tree', 'fold'),
					fold = await itemElement.waitForSelector(selector, {state: 'attached'});

				await test.expect(page.locator(itemSelector))
					.toHaveClass(new RegExp(foldedClass));

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
 * Waits for rendering of the item with the given value
 *
 * @param page
 * @param target
 * @param value
 */
export async function waitForItemWithValue(
	page: Page,
	target: JSHandle<bTree>,
	value: unknown
): Promise<ElementHandle<HTMLElement | SVGElement>> {
	const id = await target.evaluate((ctx, value) => ctx.unsafe.values.getIndex(value), value);
	return page.waitForSelector(`[data-id="${id}"]`, {state: 'attached'});
}

/**
 * Waits for rendering of items with given values
 *
 * @param page
 * @param target
 * @param values
 */
export async function waitForItems(
	page: Page,
	target: JSHandle<bTree>,
	values: Iterable<unknown>
): Promise<Array<ElementHandle<HTMLElement | SVGElement>>> {
	const ids = await target.evaluate(
		(ctx, values) => [...values].map((value) => ctx.unsafe.values.getIndex(value)),
		values
	);

	return Promise.all(ids.map((id) => page.waitForSelector(`[data-id="${id}"]`, {state: 'attached'})));
}

/**
 * Provides an API to intercept and mock response for the b-tree request
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

/**
 * Returns a selector for the passed element
 * @param elName
 */
export const createTreeSelector = DOM.elNameSelectorGenerator('b-tree');

/**
 * Creates a function to test if nodes have given modifier classes
 * @param modName
 */
export function createTestModIs(modName: string) {
	return async (
		status: boolean,
		nodes: Array<ElementHandle<HTMLElement | SVGElement>>
	): Promise<void> => {
		const classes = await Promise.all(nodes.map((node) => node.getAttribute('class')));

		test.expect(classes.every((x) => x?.includes(status ? `${modName}_true` : `${modName}_false`)))
			.toBeTruthy();
	};
}

/**
 * Checks if the page has expected count of bCheckbox elements
 *
 * @param page
 * @param expectedCount
 */
export async function waitForCheckboxCount(page: Page, expectedCount: number): Promise<void> {
	await test.expect(page.locator('.b-checkbox')).toHaveCount(expectedCount);
}

/**
 * Returns the default items for tests
 */
export function getDefaultItems(): Item[] {
	return [
		{value: 'bar'},

		{
			value: 'foo',
			children: [
				{value: 'foo_1'},
				{value: 'foo_2'},

				{
					value: 'foo_3',
					children: [{value: 'foo_3_1'}]
				},

				{value: 'foo_4'},
				{value: 'foo_5'},
				{value: 'foo_6'}
			].map((item) => ({...item, label: item.value}))
		}
	].map((item) => ({...item, label: item.value}));
}
