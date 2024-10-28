/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { isAbsURL } from 'core/url';

import type bList from 'components/base/b-list/b-list';
import type { Item } from 'components/base/b-list/interface';

/**
 * Changes the `active` modifier of the passed element and sets the `aria-selected` attribute
 *
 * @param el
 * @param isActive
 */
export function setActiveMod(this: bList, el: Element, isActive: boolean): void {
	if (this.block == null) {
		return;
	}

	this.block.setElementMod(el, 'link', 'active', isActive);

	if (!isActive && el instanceof HTMLElement) {
		el.blur();
	}

	if (el.hasAttribute('aria-selected')) {
		el.setAttribute('aria-selected', String(isActive));
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
