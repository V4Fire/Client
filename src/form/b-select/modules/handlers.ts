/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { openedSelect } from 'form/b-select/const';

import type bSelect from 'form/b-select/b-select';
import type { ModEvent, SetModEvent } from 'super/i-input-text';

/**
 * Handler: value changing of a native component `<select>`
 *
 * @param component
 * @emits `actionChange(value: V)`
 */
export function nativeChange<C extends bSelect>(component: C): void {
	const {
		unsafe,
		unsafe: {
			block: $b,
			$refs: {input}
		}
	} = component;

	if ($b == null || !unsafe.native) {
		return;
	}

	const
		checkedItems = input.querySelectorAll(`${$b!.getElSelector('item')}:checked`);

	let
		value;

	for (let i = 0; i < checkedItems.length; i++) {
		const
			el = checkedItems[i],
			id = el.getAttribute('data-id'),
			item = unsafe.indexes[String(id)];

		if (item == null) {
			continue;
		}

		if (unsafe.multiple) {
			value = value ?? new Set();
			value.add(item.value);

		} else {
			value = item.value;
			break;
		}
	}

	if (!Object.fastCompare(value, unsafe.field.get('valueStore'))) {
		unsafe.selectValue(value, true);
		unsafe.emit('actionChange', unsafe.value);
	}
}

/**
 * Handler: changing text of a component helper input
 * @param component
 */
export function textChange<C extends bSelect>(component: C): void {
	let
		{text} = component;

	if (component.unsafe.compiledMask != null) {
		text = text.replace(new RegExp(RegExp.escape(component.maskPlaceholder), 'g'), '');
	}

	const
		rgxp = new RegExp(`^${RegExp.escape(text)}`, 'i');

	let
		some = false;

	for (let i = 0; i < component.items.length; i++) {
		const
			item = component.items[i];

		if (item.label != null && rgxp.test(item.label)) {
			component.selectValue(item.value);
			some = true;
			break;
		}
	}

	if (some) {
		void component.open();
		void component.unsafe.setScrollToMarkedOrSelectedItem();

	} else {
		void component.close();
	}
}

/**
 * Handler: typing text into a helper text input to search select options
 *
 * @param component
 * @param e
 *
 * @emits `actionChange(value: V)`
 */
export function searchInput<C extends bSelect>(component: C, e: InputEvent): void {
	const
		{unsafe} = component;

	const
		prevValue = component.value,
		target = <HTMLInputElement>e.target;

	if (unsafe.compiledMask != null) {
		return;
	}

	unsafe.text = target.value;
	textChange(component);

	if (prevValue !== component.value) {
		component.emit('actionChange', component.value);
	}
}

/**
 * Handler: click to some item element
 *
 * @param component
 * @param itemEl
 * @emits `actionChange(value: V)`
 */
export function itemClick<C extends bSelect>(component: C, itemEl: CanUndef<Element>): void {
	void component.close();

	if (itemEl == null || component.native) {
		return;
	}

	const
		id = itemEl.getAttribute('data-id'),
		item = component.unsafe.indexes[String(id)];

	if (item == null) {
		return;
	}

	if (component.multiple) {
		component.toggleValue(item.value);

	} else {
		component.text = item.label ?? component.text;
		component.selectValue(item.value);
	}

	component.emit('actionChange', component.value);
}

/**
 * Handler: "navigation" over select items via "arrow" buttons
 *
 * @param component
 * @param e
 */
export async function itemsNavigate<C extends bSelect>(component: C, e: KeyboardEvent): Promise<void> {
	const
		{unsafe} = component;

	const validKeys = {
		ArrowUp: true,
		ArrowDown: true,
		Enter: true
	};

	if (unsafe.native || validKeys[e.key] !== true || unsafe.mods.focused !== 'true') {
		return;
	}

	e.preventDefault();

	const
		{block: $b} = unsafe;

	if ($b == null) {
		return;
	}

	const getMarkedOrSelectedItem = () =>
		$b!.element('item', {marked: true}) ??
		$b!.element('item', {selected: true});

	let
		currentItemEl = getMarkedOrSelectedItem();

	const markItem = (itemEl: Nullable<Element>) => {
		if (currentItemEl != null) {
			$b!.removeElMod(currentItemEl, 'item', 'marked');
		}

		if (itemEl == null) {
			return false;
		}

		$b!.setElMod(itemEl, 'item', 'marked', true);
		void unsafe.setScrollToMarkedOrSelectedItem();

		return true;
	};

	switch (e.key) {
		case 'Enter':
			unsafe.onItemClick(currentItemEl);
			break;

		case 'ArrowUp':
			if (currentItemEl?.previousElementSibling != null) {
				markItem(currentItemEl.previousElementSibling);

			} else {
				await unsafe.close();
			}

			break;

		case 'ArrowDown': {
			if (unsafe.mods.opened !== 'true') {
				await unsafe.open();

				if (unsafe.value != null) {
					return;
				}

				currentItemEl = currentItemEl ?? getMarkedOrSelectedItem();
			}

			markItem(currentItemEl?.nextElementSibling) || markItem($b!.element('item'));
			break;
		}

		default:
			// Do nothing
	}
}

/**
 * @see [[iOpenToggle.onOpenedChange]]
 * @param component
 * @param e
 */
export function openedChange<C extends bSelect>(component: C, e: ModEvent | SetModEvent): void {
	const {
		unsafe,
		unsafe: {async: $a}
	} = component;

	if (unsafe.native) {
		return;
	}

	// Status: opened == false or opened == null
	if (e.type === 'set' && e.value === 'false' || e.type === 'remove') {
		if (openedSelect.link === unsafe) {
			openedSelect.link = null;
		}

		if (unsafe.mods.focused !== 'true') {
			$a.off({
				group: 'navigation'
			});
		}

		return;
	}

	$a.off({
		group: 'navigation'
	});

	if (!unsafe.multiple) {
		if (openedSelect.link != null) {
			openedSelect.link.close().catch(() => undefined);
		}

		openedSelect.link = unsafe;
	}

	$a.on(document, 'keydown', unsafe.onItemsNavigate.bind(unsafe), {
		group: 'navigation'
	});
}
