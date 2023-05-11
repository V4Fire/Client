/* eslint-disable @typescript-eslint/no-unused-vars-experimental */

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { ModEvent, SetModEvent } from 'components/form/b-select/b-select';
import type bSelect from 'components/form/b-select/b-select';

import { openedSelect } from 'components/form/b-select/const';

export default abstract class SelectEventHandlers {

	/** @see [[SelectEventHandlers.prototype.onOpenedChange]] */
	// eslint-disable-next-line @typescript-eslint/require-await
	static async onOpenedChange(component: bSelect, e: ModEvent | SetModEvent): Promise<void> {
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

	/** @see [[SelectEventHandlers.prototype.onNativeChange]] */
	static onNativeChange(component: bSelect): void {
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
			itemName = $b.getElementSelector('item'),
			checkedItems = input.querySelectorAll(`${itemName}:checked`);

		let
			value;

		for (let i = 0; i < checkedItems.length; i++) {
			const
				el = checkedItems[i],
				id = el.getAttribute('data-id'),
				item = unsafe.values.getItem(id ?? -1);

			if (item == null) {
				continue;
			}

			if (unsafe.multiple) {
				value ??= new Set();
				value.add(item.value);

			} else {
				value = item.value;
				break;
			}
		}

		if (!Object.fastCompare(value, unsafe.field.get('activeStore'))) {
			unsafe.selectValue(value, true);
			unsafe.emit('actionChange', unsafe.value);
		}
	}

	/** @see [[SelectEventHandlers.prototype.onSearchInput]] */
	static onSearchInput(component: bSelect, e: InputEvent): void {
		const
			{unsafe} = component;

		const
			target = <HTMLInputElement>e.target;

		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (unsafe.compiledMask != null) {
			return;
		}

		unsafe.text = target.value;
		unsafe.onTextChange();
	}

	/** @see [[SelectEventHandlers.prototype.onItemsNavigate]] */
	static async onItemsNavigate(component: bSelect, e: KeyboardEvent): Promise<void> {
		const
			{unsafe} = component;

		const validKeys = {
			ArrowUp: true,
			ArrowDown: true,
			Enter: true
		};

		if (unsafe.native || validKeys[e.key] !== true || unsafe.mods.focused !== 'true') {
			if (e.key.length === 1) {
				await unsafe.focus();
			}

			return;
		}

		e.preventDefault();

		const
			{block: $b} = unsafe;

		if ($b == null) {
			return;
		}

		const getMarkedOrSelectedItem = () =>
			// @ts-ignore (TS 4.6.3)
			$b.element('item', {marked: true}) ??
			$b.element('item', {selected: true});

		let
			currentItemEl = getMarkedOrSelectedItem();

		const markItem = (itemEl: Nullable<Element>) => {
			if (currentItemEl != null) {
				$b.removeElementMod(currentItemEl, 'item', 'marked');
			}

			if (itemEl == null) {
				return false;
			}

			$b.setElementMod(itemEl, 'item', 'marked', true);
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

					currentItemEl ??= getMarkedOrSelectedItem();
				}

				markItem(currentItemEl?.nextElementSibling) || markItem($b.element('item'));
				break;
			}

			default:
			// Do nothing
		}
	}

	/** @see [[SelectEventHandlers.prototype.onItemClick]] */
	static onItemClick(component: bSelect, itemEl: Nullable<Element>): void {
		void component.close();

		if (itemEl == null || component.native) {
			return;
		}

		const
			id = itemEl.getAttribute('data-id'),
			item = component.unsafe.values.getItem(id ?? -1);

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

	/** @see [[SelectEventHandlers.prototype.onClear]] */
	static async onClear(component: bSelect): Promise<void> {
		if (await component.clear()) {
			component.emit('actionChange', component.value);
		}
	}

	/** @see [[SelectEventHandlers.prototype.onTextChange]] */
	static onTextChange(component: bSelect): void {
		let
			{text} = component;

		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (component.unsafe.compiledMask != null) {
			text = text.replace(new RegExp(RegExp.escape(component.maskPlaceholder), 'g'), '');
		}

		if (text !== '') {
			const
				rgxp = new RegExp(`^${RegExp.escape(text)}`, 'i');

			for (let i = 0; i < component.items.length; i++) {
				const
					item = component.items[i];

				if (item.label != null && rgxp.test(item.label)) {
					if (component.selectValue(item.value, true)) {
						component.emit('actionChange', component.value);
					}

					void component.open();
					void component.unsafe.setScrollToMarkedOrSelectedItem();

					return;
				}
			}
		}

		if (component.value !== undefined) {
			component.value = undefined;
			component.emit('actionChange', undefined);
		}

		void component.close();
	}

	/** @see [[iOpenToggle.onOpenedChange]] */
	onOpenedChange(e: ModEvent | SetModEvent): Promise<void> {
		return Object.throw();
	}

	/**
	 * Handler: value changing of a native component `<select>`
	 *
	 * @emits `actionChange(value: V)`
	 */
	protected onNativeChange(): void {
		return Object.throw();
	}

	/**
	 * Handler: typing text into a helper text input to search select options
	 *
	 * @param e
	 * @emits `actionChange(value: this['Active'])`
	 */
	protected onSearchInput(e: InputEvent): void {
		return Object.throw();
	}

	/**
	 * Handler: "navigation" over the select via "arrow" buttons
	 * @param e
	 */
	protected onItemsNavigate(e: KeyboardEvent): void {
		return Object.throw();
	}

	/**
	 * Handler: click to some item element
	 *
	 * @param itemEl
	 * @emits `actionChange(value: this['Active'])`
	 */
	protected onItemClick(itemEl: Nullable<Element>): void {
		return Object.throw();
	}

	/**
	 * Handler: clearing of a component value
	 * @emits `actionChange(value: this['Active'])`
	 */
	protected onClear(): Promise<void> {
		return Object.throw();
	}

	/**
	 * Handler: changing text of a component helper input
   *
	 * @emits `actionChange(value: V)`
	 */
	protected onTextChange(): void {
		return Object.throw();
	}
}
