/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { ElementHandle, JSHandle, Page } from 'playwright';

import test from 'tests/config/unit/test';

import DOM from 'tests/helpers/dom';
import Component from 'tests/helpers/component';

import type bTree from 'components/base/b-tree/b-tree';
import type { Item } from 'components/base/b-tree/b-tree';

/**
 * Returns a selector for the passed bTree element
 * @param elName
 */
export const createTreeSelector = DOM.elNameSelectorGenerator('b-tree');

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
			exterior: 'demo',
			...attrs
		},

		children: children ?? {default: ({item}) => item.label}
	});
}

/**
 * Returns the total number of tree items based on the value of the component's prop
 * @param items
 */
export function getItemsCount(items: Item[]): number {
	let count = 0;

	items.forEach(({children}) => {
		count++;

		if (children != null) {
			count += getItemsCount(children);
		}
	});

	return count;
}

/**
 * Returns the number of rendered tree items
 * @param tree
 */
export function getRenderedNodesCount(tree: JSHandle<bTree>): Promise<number> {
	return tree.evaluate((ctx) => {
		const nodes = ctx.$el!.querySelectorAll(`.${ctx.provide.fullElementName('node')}`);
		return nodes.length;
	});
}

/**
 * Returns a promise that will not resolve until the tree has a specified number of rendered items
 *
 * @param tree
 * @param number
 */
export function waitForNumberOfNodes(tree: JSHandle<bTree>, number: number): Promise<boolean> {
	return tree.evaluate(({unsafe}, number) => unsafe.async.wait(() => {
		const nodes = unsafe.$el!.querySelectorAll(`.${unsafe.provide.fullElementName('node')}`);
		return nodes.length === number;
	}), number);
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
 * Waits for rendering of items with the given values
 *
 * @param page
 * @param target
 * @param values
 */
export async function waitForItemsWithValues(
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
 * Creates a function to test if nodes have the given modifier classes
 * @param modName
 */
export function createExpectMod(modName: string) {
	return async (
		status: boolean,
		nodes: Array<ElementHandle<HTMLElement | SVGElement>>
	): Promise<void> => {
		const classes = await Promise.all(nodes.map((node) => node.getAttribute('class')));
		test.expect(classes.every((x) => x?.includes(status ? `${modName}_true` : `${modName}_false`))).toBeTruthy();
	};
}
