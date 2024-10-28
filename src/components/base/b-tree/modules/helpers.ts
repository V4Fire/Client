/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type bTree from 'components/base/b-tree/b-tree';
import type { Item } from 'components/base/b-tree/interface';

/**
 * Changes the `active` modifier of the passed element and sets the `aria-selected` attribute
 *
 * @param el
 * @param status
 */
export function setActiveMod(this: bTree, el: Element, status: boolean): void {
	if (this.block == null) {
		return;
	}

	this.block.setElementMod(el, 'node', 'active', status);

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

	if (items.some(needNormalize)) {
		items = Object.fastClone(items);
		items.forEach((el) => normalize(el));
	}

	return items;

	function needNormalize(item: bTree['Item']) {
		return item.value === undefined || !('parentValue' in item);
	}

	function normalize(item: bTree['Item'], parentValue?: unknown): boolean {
		i++;

		if (item.value === undefined) {
			item.value = i;
		}

		if (!('parentValue' in item)) {
			item.parentValue = parentValue;

			if (Object.isArray(item.children)) {
				if (that.isActive(item.value)) {
					that.unfoldedStore.add(item.value);
				}

				for (const el of item.children) {
					if (normalize(el, item.value)) {
						that.unfoldedStore.add(item.value);
						break;
					}
				}
			}
		}

		return that.isActive(item.value) || that.unfoldedStore.has(item.value) || item.folded === false;
	}
}
