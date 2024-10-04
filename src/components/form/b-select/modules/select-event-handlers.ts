/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import symbolGenerator from 'core/symbol';
import type iOpenToggle from 'components/traits/i-open-toggle/i-open-toggle';

import type bSelect from 'components/form/b-select/b-select';
import type { ModEvent, SetModEvent } from 'components/form/b-select/b-select';

import { openedSelect } from 'components/form/b-select/const';

const
	$$ = symbolGenerator(),
	navigationEventOpts = {group: 'navigation'};

export default abstract class SelectEventHandlers {
	/** {@link SelectEventHandlers.prototype.onOpenedChange} */
	// eslint-disable-next-line @typescript-eslint/require-await
	static async onOpenedChange(component: bSelect, e: ModEvent | SetModEvent): Promise<void> {
		const {
			unsafe
		} = component;

		if (unsafe.native) {
			return;
		}

		// Status: opened == false or opened == null
		if (e.type === 'set' && e.value === 'false' || e.type === 'remove') {
			if (openedSelect.link === component) {
				openedSelect.link = null;
			}

			if (unsafe.mods.focused !== 'true') {
				component.handleKeydown(false);
			}

			return;
		}

		component.handleKeydown(false);

		if (!unsafe.multiple) {
			if (openedSelect.link != null) {
				openedSelect.link.close().catch(() => undefined);
			}

			openedSelect.link = component;
		}

		component.handleKeydown(true);
	}

	/** {@link SelectEventHandlers.prototype.onNativeChange} */
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
			value: CanUndef<Set<unknown> | unknown> = undefined;

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
				(<Set<unknown>>value).add(item.value);

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

	/** {@link SelectEventHandlers.prototype.onSearchInput} */
	static onSearchInput(component: bSelect, e: InputEvent): void {
		const
			{unsafe} = component;

		const
			target = <HTMLInputElement>e.target;

		if (unsafe.compiledMask != null) {
			return;
		}

		unsafe.text = target.value;
		unsafe.onTextChange();
	}

	/** {@link SelectEventHandlers.prototype.onItemsNavigate} */
	static async onItemsNavigate(component: bSelect, e: KeyboardEvent): Promise<void> {
		const
			{unsafe} = component,
			{async: $a} = unsafe;

		const validKeys = {
			ArrowUp: true,
			ArrowDown: true,
			Enter: true
		};

		if (unsafe.native || validKeys[e.key] !== true || unsafe.mods.focused !== 'true') {
			if (e.key.length === 1) {
				await unsafe.focus();
			}

			// Remove the navigation event handler if the user has switched to another element
			if (e.key === 'Tab') {
				const opts = {...navigationEventOpts, label: $$.onTabKeyup};

				$a.on(document, 'keyup', (e: KeyboardEvent) => {
					if (e.key === 'Tab') {
						const isFocused = component.isFocused || component.$el?.contains(document.activeElement);

						if (isFocused) {
							$a.off(opts);

						} else {
							component.handleKeydown(false);
						}
					}
				}, opts);
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

	/** {@link SelectEventHandlers.prototype.onItemClick} */
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
			const prevText = component.text;
			component.selectValue(item.value);

			// Preserve previous text if item has no label
			if (item.label == null) {
				component.text = prevText;
			}
		}

		component.emit('actionChange', component.value);
	}

	/** {@link SelectEventHandlers.prototype.onClear} */
	static async onClear(component: bSelect): Promise<void> {
		if (await component.clear()) {
			component.emit('actionChange', component.value);
		}
	}

	/** {@link SelectEventHandlers.prototype.onTextChange} */
	static onTextChange(component: bSelect): void {
		let
			{text} = component;

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

	/** {@link SelectEventHandlers.prototype.handleKeydown} */
	static handleKeydown(component: bSelect, enabled: boolean): void {
		const
			{unsafe} = component,
			{async: $a} = unsafe;

		unsafe.keydownHandlerEnabled = enabled;

		if (enabled) {
			$a.on(document, 'keydown', unsafe.onItemsNavigate.bind(unsafe), navigationEventOpts);

		} else {
			$a.off(navigationEventOpts);
		}
	}

	/** {@link iOpenToggle.prototype.onOpenedChange} */
	onOpenedChange(_e: ModEvent | SetModEvent): Promise<void> {
		return Object.throw();
	}

	/**
	 * Handler: changing the value of the native component `<select>`
	 * @emits `actionChange(value: V)`
	 */
	onNativeChange(): void {
		return Object.throw();
	}

	/**
	 * Handler: entering text into auxiliary text input to search for choices
	 *
	 * @param _e
	 * @emits `actionChange(value: this['Active'])`
	 */
	onSearchInput(_e: InputEvent): void {
		return Object.throw();
	}

	/**
	 * Handler: "navigate" the selection using the arrow buttons
	 * @param _e
	 */
	onItemsNavigate(_e: KeyboardEvent): void {
		return Object.throw();
	}

	/**
	 * Handler: click on any item element
	 *
	 * @param _itemEl
	 * @emits `actionChange(value: this['Active'])`
	 */
	onItemClick(_itemEl: Nullable<Element>): void {
		return Object.throw();
	}

	/**
	 * Handler: clearing the component value
	 * @emits `actionChange(value: this['Active'])`
	 */
	onClear(): Promise<void> {
		return Object.throw();
	}

	/**
	 * Handler: changing the text of the component helper input
	 * @emits `actionChange(value: V)`
	 */
	onTextChange(): void {
		return Object.throw();
	}

	/**
	 * Enables or disables `keydown` event handler
	 * @param _enabled
	 */
	handleKeydown(_enabled: boolean): void {
		return Object.throw();
	}
}
