/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type Block from 'components/friends/block/class';

import type bTree from 'components/base/b-tree/b-tree';
import type { Item } from 'components/base/b-tree/interface';

/**
 * Changes element's node `active` modifier and set's `aria-selected` attribute.
 *
 * @param block
 * @param el
 * @param status
 */
export function setActiveMod(block: Nullable<Block>, el: Element, status: boolean): void {
	if (block == null) {
		return;
	}

	block.setElementMod(el, 'node', 'active', status);

	if (el.hasAttribute('aria-selected')) {
		el.setAttribute('aria-selected', String(status));
	}
}

/**
 * Normalizes the specified items and returns them
 * @param [items]
 */
export function normalizeItems<T extends Item[]>(this: bTree, items: T): T {

	const
		that = this;

	let
		i = -1;

	items = Object.fastClone(items);
	items.forEach((el) => normalize(el));

	return items;

	function normalize(item: bTree['Item'], parentValue?: unknown) {
		i++;

		if (item.value === undefined) {
			item.value = i;
		}

		if (!('parentValue' in item)) {
			item.parentValue = parentValue;

			if (Object.isArray(item.children)) {
				if (that.isActive(item.value)) {
					item.folded = false;
				}

				for (const el of item.children) {
					if (normalize(el, item.value)) {
						item.folded = false;
						break;
					}
				}
			}
		}

		return that.isActive(item.value) || item.folded === false;
	}
}
