/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { isAbsURL } from 'core/url';

import type Block from 'components/friends/block/class';

import type bList from 'components/base/b-list/b-list';
import type { Item } from 'components/base/b-list/interface';

/**
 * Changes element's link `active` modifier and set's `aria-selected` attribute.
 *
 * @param block
 * @param el
 * @param status
 */
export function setActiveMod(block: Nullable<Block>, el: Element, status: boolean): void {
	if (block == null) {
		return;
	}

	block.setElementMod(el, 'link', 'active', status);

	if (el.hasAttribute('aria-selected')) {
		el.setAttribute('aria-selected', String(status));
	}
}

/**
 * Normalizes the specified items and returns them
 * @param [items]
 */
export function normalizeItems(this: bList, items: CanUndef<Item[]>): Item[] {
	if (items == null) {
		return [];
	}

	return items.map((item) => {
		let {value, href} = item;

		if (value === undefined) {
			value = href;
		}

		const needAutoHref =
			href === undefined &&
			value !== undefined &&
			this.autoHref;

		if (needAutoHref) {
			href = String(value);

			if (!isAbsURL.test(href) && !href.startsWith('/') && !href.startsWith('#')) {
				href = `#${href}`;
			}
		}

		const
			classes = this.provide.hintClasses(item.hintPos).concat(item.classes ?? []),
			attrs = {...item.attrs};

		if (href === undefined) {
			attrs.role = 'tab';
		}

		return {
			...item,

			attrs,
			classes,

			value,
			href
		};
	});
}

