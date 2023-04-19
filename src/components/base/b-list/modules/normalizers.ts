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
 * Normalizes the specified items and returns them
 * @param [items]
 */
export function normalizeItems(this: bList, items: CanUndef<Item[]>): Item[] {
	const result: Item[] = [];

	if (items == null) {
		return result;
	}

	for (let i = 0; i < items.length; i++) {
		const
			item = items[i];

		let
			{value, href} = item;

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

		result.push({
			...item,

			attrs,
			classes,

			value,
			href
		});
	}

	return result;
}
