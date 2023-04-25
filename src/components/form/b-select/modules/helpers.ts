/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { $$ } from 'components/form/b-select/const';

import type bSelect from 'components/form/b-select/b-select';
import type { Items } from 'components/form/b-select/interface';
import type Block from 'components/friends/block/class';

/**
 * Normalizes the specified items and returns it
 * @param items
 */
export function normalizeItems(items: CanUndef<Items>): Items {
	if (items == null) {
		return [];
	}

	return items.map((item) => ({
		...item,
		active: item.selected,
		value: item.value !== undefined ? item.value : item.label
	}));
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
			// @ts-ignore (TS 4.6.3)
			$b.element<HTMLDivElement>('item', {marked: true}) ??
			$b.element<HTMLDivElement>('item', {selected: true});

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

/**
 * Returns a link to the selected item element.
 * If the component is switched to the `multiple` mode, the getter will return an array of elements.
 */
export function getSelectedElement<C extends bSelect>(component: C): CanPromise<CanNull<CanArray<HTMLOptionElement>>> {
	const {
		value,
		unsafe
	} = component;

	const getEl = (value) => {
		const
			id = unsafe.values.getIndex(value);

		if (id != null) {
			return unsafe.block?.element<HTMLOptionElement>('item', {id}) ?? null;
		}
	};

	return unsafe.waitComponentStatus('ready', () => {
		if (unsafe.multiple) {
			if (!Object.isSet(value)) {
				return [];
			}

			return [...value].flatMap((val) => getEl(val) ?? []);
		}

		return getEl(value) ?? null;
	});
}

/**
 * Changes the `selected` modifier of the passed element and sets the `aria-selected` attribute
 *
 * @param block
 * @param el
 * @param selected
 */
export function setSelectedMod(this: bSelect, block: Nullable<Block>, el: HTMLOptionElement, selected: boolean): void {
	if (block == null) {
		return;
	}

	block.setElementMod(el, 'item', 'selected', selected);

	if (this.native) {
		el.selected = false;

	} else {
		el.setAttribute('aria-selected', String(selected));
	}
}
