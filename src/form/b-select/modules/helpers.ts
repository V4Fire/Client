/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { $$ } from 'form/b-select/const';

import type bSelect from 'form/b-select/b-select';
import type { Items } from 'form/b-select/interface';

/**
 * Initializes component values
 * @param component
 */
export function initComponentValues<C extends bSelect>(component: C): void {
	const
		{unsafe} = component;

	const
		values = new Map(),
		indexes = {};

	const
		valueStore = unsafe.field.get('valueStore');

	for (let i = 0; i < unsafe.items.length; i++) {
		const
			item = unsafe.items[i],
			val = item.value;

		if (item.selected && (unsafe.multiple ? unsafe.valueProp === undefined : valueStore === undefined)) {
			unsafe.selectValue(val);
		}

		values.set(val, i);
		indexes[i] = item;
	}

	unsafe.values = values;
	unsafe.indexes = indexes;
}

/**
 * @param component
 */
export function initModEvents<C extends bSelect>(component: C): void {
	const
		{unsafe} = component;

	unsafe.sync.mod('native', 'native', Boolean);
	unsafe.sync.mod('multiple', 'multiple', Boolean);
	unsafe.sync.mod('opened', 'multiple', Boolean);
}

/**
 * Normalizes the specified items and returns it
 * @param items
 */
export function normalizeItems(items: CanUndef<Items>): Items {
	const
		res = <Items>[];

	if (items == null) {
		return res;
	}

	for (let i = 0; i < items.length; i++) {
		const
			item = items[i];

		res.push({
			...item,
			value: item.value !== undefined ? item.value : item.label
		});
	}

	return res;
}

/**
 * Sets the scroll position to the first marked or selected item
 */
export async function setScrollToMarkedOrSelectedItem<C extends bSelect>(component: C): Promise<boolean> {
	const
		{unsafe} = component;

	if (unsafe.native) {
		return false;
	}

	try {
		const dropdown = await unsafe.waitRef<HTMLDivElement>('dropdown', {label: $$.setScrollToSelectedItem});

		const
			{block: $b} = unsafe;

		if ($b == null) {
			return false;
		}

		const itemEl =
			$b!.element<HTMLDivElement>('item', {marked: true}) ??
			$b!.element<HTMLDivElement>('item', {selected: true});

		if (itemEl == null) {
			return false;
		}

		let {
			clientHeight,
			scrollTop
		} = dropdown;

		let {
			offsetTop: itemOffsetTop,
			offsetHeight: itemOffsetHeight
		} = itemEl;

		itemOffsetHeight += parseFloat(getComputedStyle(itemEl).marginTop);

		if (itemOffsetTop > clientHeight + scrollTop) {
			while (itemOffsetTop > clientHeight + scrollTop) {
				scrollTop += itemOffsetHeight;
			}

		} else {
			while (itemOffsetTop < scrollTop) {
				scrollTop -= itemOffsetHeight;
			}
		}

		dropdown.scrollTop = scrollTop;

	} catch {
		return false;
	}

	return true;
}
