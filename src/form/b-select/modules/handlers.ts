/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type bSelect from 'form/b-select/b-select';

/**
 * Handler: value changing of a native component `<select>`
 *
 * @param component
 * @emits `actionChange(value: V)`
 */
export function onNativeChange<C extends bSelect>(component: C): void {
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
 *
 * @param component
 * @emits `actionChange(value: V)`
 */
export function onTextChange<C extends bSelect>(component: C): void {
	if (!component.isFocused) {
		return;
	}

	let
		{text} = component;

	if (component.unsafe.compiledMask != null) {
		text = text.replace(new RegExp(RegExp.escape(component.maskPlaceholder), 'g'), '');
	}

	const
		prevValue = component.value,
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

	if (prevValue !== component.value) {
		component.emit('actionChange', component.value);
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
 */
export function onSearchInput<C extends bSelect>(component: C, e: InputEvent): void {
	const
		target = <HTMLInputElement>e.target;

	if (component.unsafe.compiledMask != null) {
		return;
	}

	component.text = target.value;
}

/**
 * Handler: click to some item element
 *
 * @param component
 * @param itemEl
 * @emits `actionChange(value: V)`
 */
export function onItemClick<C extends bSelect>(component: C, itemEl: CanUndef<Element>): void {
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
export async function onItemsNavigate<C extends bSelect>(component: C, e: KeyboardEvent): Promise<void> {
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
