/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:components/form/b-select/README.md]]
 * @packageDocumentation
 */

import SyncPromise from 'core/promise/sync';

import { derive } from 'core/functools/trait';

import Block, { setElementMod, removeElementMod, getElementSelector, element, elements } from 'components/friends/block';
import DOM, { delegateElement } from 'components/friends/dom';

import iItems, { IterationKey } from 'components/traits/i-items/i-items';
import iActiveItems from 'components/traits/i-active-items/i-active-items';
import iOpenToggle, { CloseHelperEvents } from 'components/traits/i-open-toggle/i-open-toggle';

import iInputText, {

	component,

	field,
	system,
	computed,
	hook,
	watch,

	ModsDecl,
	UnsafeGetter,

	ValidatorsDecl,
	ValidatorParams,
	ValidatorResult

} from 'components/super/i-input-text/i-input-text';

import Mask, * as MaskAPI from 'components/super/i-input-text/mask';

import { openedSelect } from 'components/form/b-select/const';
import type { Value, FormValue, Items, UnsafeBSelect } from 'components/form/b-select/interface';

import iSelectProps from 'components/form/b-select/props';
import Values from 'components/form/b-select/modules/values';
import SelectEventHandlers from 'components/form/b-select/modules/select-event-handlers';

import * as h from 'components/form/b-select/modules/helpers';

export * from 'components/form/b-input/b-input';
export * from 'components/traits/i-open-toggle/i-open-toggle';

export * from 'components/form/b-select/const';
export * from 'components/form/b-select/interface';

export { Value, FormValue };

DOM.addToPrototype({delegateElement});
Block.addToPrototype({setElementMod, removeElementMod, getElementSelector, element, elements});
Mask.addToPrototype(MaskAPI);

interface bSelect extends Trait<typeof iOpenToggle>, Trait<typeof iActiveItems>, Trait<typeof SelectEventHandlers> {}

@component({
	functional: {
		wait: undefined,
		dataProvider: undefined
	}
})

@derive(SelectEventHandlers, iOpenToggle, iActiveItems)
class bSelect extends iSelectProps implements iOpenToggle, iActiveItems {
	override get unsafe(): UnsafeGetter<UnsafeBSelect<this>> {
		return Object.cast(this);
	}

	/** {@link iSelectProps.itemsProp} */
	get items(): this['Items'] {
		return <this['Items']>this.field.get('itemsStore');
	}

	/** {@link bSelect.items} */
	set items(value: this['Items']) {
		this.field.set('itemsStore', value);

		if (this.isRelatedToSSR) {
			this.syncItemsWatcher(this.items);
		}
	}

	/** {@link iActiveItems.activeChangeEvent} */
	@system()
	readonly activeChangeEvent: string = 'change';

	/** {@link iActiveItems.active} */
	@computed({cache: true})
	get active(): this['Active'] {
		return iActiveItems.getActive(this);
	}

	/** {@link iActiveItems.activeElement} */
	@computed({cache: true, dependencies: ['active']})
	get activeElement(): CanPromise<CanNull<CanArray<HTMLOptionElement>>> {
		return h.getSelectedElement.call(this);
	}

	/**
	 * {@link iActiveItems.activeStore}
	 * {@link iActiveItems.linkActiveStore}
	 */
	@system<bSelect>({
		unique: true,
		init: (o) => {
			o.watch('valueProp', (val) => o.setActive(val, true));
			o.watch('modelValue', (val) => o.setActive(val, true));
			return iActiveItems.linkActiveStore(o, (val) => o.resolveValue(o.valueProp ?? o.modelValue ?? val));
		}
	})

	activeStore!: iActiveItems['activeStore'];

	@computed({cache: true, dependencies: ['active']})
	override get value(): CanUndef<this['Active']> {
		const val = this.active;

		if (this.multiple && Object.isSet(val) && val.size === 0) {
			return undefined;
		}

		return val;
	}

	override set value(value: CanUndef<this['ActiveProp']>) {
		if (value === undefined) {
			this.unselectValue(this.value);

		} else {
			this.selectValue(value, true);
			void this.setScrollToMarkedOrSelectedItem();
		}
	}

	override get default(): this['Active'] {
		const val = this.field.get('defaultProp');

		if (this.multiple) {
			return new Set(Object.isIterable(val) ? val : Array.toArray(val));
		}

		return val;
	}

	override get formValue(): Promise<this['FormValue']> {
		const formValue = super['formValueGetter']();

		return SyncPromise.resolve(formValue)
			.then((val) => this.multiple && Object.isSet(val) ? [...val] : val);
	}

	override get rootAttrs(): Dictionary {
		const attrs = {
			...super['rootAttrsGetter']()
		};

		if (!this.native) {
			Object.assign(attrs, {
				role: 'listbox',
				'aria-multiselectable': this.multiple
			});
		}

		return attrs;
	}

	/**
	 * Handler: changing the text of the component helper input
	 */
	@computed({cache: true})
	get onTextChange(): SelectEventHandlers['onTextChange'] {
		return this.async.debounce(SelectEventHandlers.onTextChange.bind(null, this), 200);
	}

	static override readonly mods: ModsDecl = {
		opened: [
			...iOpenToggle.mods.opened!,
			['false']
		],

		native: [
			'true',
			'false'
		],

		multiple: [
			'true',
			'false'
		]
	};

	static override validators: ValidatorsDecl<bSelect> = {
		//#if runtime has iInput/validators
		...iInputText.validators,

		async required({message, showMessage = true}: ValidatorParams): Promise<ValidatorResult<boolean>> {
			const
				val = await this.formValue;

			if (this.multiple ? Object.size(val) === 0 : val === undefined) {
				this.setValidationMessage(this.getValidatorMessage(false, message, this.t`Required field`), showMessage);
				return false;
			}

			return true;
		}

		//#endif
	};

	/**
	 * Internal API for working with component values
	 */
	@system<bSelect>({
		unique: true,
		init: (o) => new Values(o)
	})

	protected values!: Values;

	/** {@link bSelect.items} */
	@field<bSelect>((o) => o.sync.link<Items>((val) => {
		if (o.dataProvider != null) {
			return <CanUndef<Items>>o.itemsStore ?? [];
		}

		return o.normalizeItems(val);
	}))

	protected itemsStore!: this['Items'];

	/**
	 * True if keydown handler is enabled.
	 * This flag is needed to restore event handler for functional components.
	 */
	@system()
	protected keydownHandlerEnabled: boolean = false;

	/** @inheritDoc */
	declare protected readonly $refs: iInputText['$refs'] & {
		dropdown?: Element;
	};

	/** {@link iActiveItems.activeElement} */
	@computed({cache: true, dependencies: ['active']})
	protected get selectedElement(): CanPromise<CanNull<CanArray<HTMLOptionElement>>> {
		return this.activeElement;
	}

	override reset(): Promise<boolean> {
		const compare = (a, b) => {
			if (this.multiple && Object.isSet(a) && Object.isSet(b)) {
				return Object.fastCompare([...a], [...b]);
			}

			return a === b;
		};

		if (!compare(this.value, this.default)) {
			return super.reset();
		}

		return SyncPromise.resolve(false);
	}

	/** {@link iActiveItems.prototype.setActive} */
	setActive(value: this['ActiveProp'], unsetPrevious: boolean = false): boolean {
		if (!iActiveItems.setActive(this, value, unsetPrevious)) {
			return false;
		}

		if (!this.multiple) {
			const item = this.values.getItemByValue(value);
			this.text = item?.label ?? '';
		}

		const {block: $b} = this;

		if ($b == null) {
			return true;
		}

		const
			id = this.values.getIndex(value),
			itemEl = id != null ? $b.element<HTMLOptionElement>('item', {id}) : null;

		if (!this.multiple || unsetPrevious) {
			Object.forEach($b.elements<HTMLOptionElement>('item', {selected: true}), (el) => {
				if (el !== itemEl) {
					h.setSelectedMod.call(this, el, false);
				}
			});
		}

		SyncPromise.resolve(this.activeElement).then((els) => {
			Array.toArray(els).forEach((el) => {
				h.setSelectedMod.call(this, el, true);
			});
		}).catch(stderr);

		return true;
	}

	/** {@link iActiveItems.prototype.unsetActive} */
	unsetActive(value: this['ActiveProp']): boolean {
		const {activeElement: previousActiveElement} = this;

		if (!iActiveItems.unsetActive(this, value)) {
			return false;
		}

		if (!this.multiple) {
			this.text = '';
		}

		if (this.block == null) {
			return true;
		}

		SyncPromise.resolve(previousActiveElement).then((els) => {
			Array.toArray(els).forEach((el) => {
				const
					id = el.getAttribute('data-id'),
					item = this.values.getItem(id ?? -1);

				if (item == null) {
					return;
				}

				const needChangeMod = this.multiple && Object.isSet(value) ?
					value.has(item.value) :
					value === item.value;

				if (needChangeMod) {
					h.setSelectedMod.call(this, el, false);
				}
			});
		}).catch(stderr);

		return true;
	}

	/** {@link iActiveItems.prototype.isActive} */
	isSelected(value: unknown): boolean {
		return this.isActive(value);
	}

	/** {@link iActiveItems.prototype.setActive} */
	selectValue(value: this['ActiveProp'], unsetPrevious: boolean = false): boolean {
		return this.setActive(value, unsetPrevious);
	}

	/** {@link iActiveItems.prototype.unsetActive} */
	unselectValue(value: this['ActiveProp']): boolean {
		return this.unsetActive(value);
	}

	/** {@link iActiveItems.prototype.toggleActive} */
	toggleValue(value: this['ActiveProp'], unsetPrevious: boolean = false): CanUndef<this['Active']> {
		const val = this.toggleActive(value, unsetPrevious);

		if (this.multiple && Object.isSet(val) && val.size === 0) {
			return undefined;
		}

		return val;
	}

	/** {@link iOpenToggle.prototype.open} */
	async open(...args: unknown[]): Promise<boolean> {
		if (this.multiple || this.native) {
			return false;
		}

		if (await iOpenToggle.open(this, ...args)) {
			await this.setScrollToMarkedOrSelectedItem();
			return true;
		}

		return false;
	}

	/** {@link iOpenToggle.prototype.close} */
	async close(...args: unknown[]): Promise<boolean> {
		if (this.native) {
			return false;
		}

		if (this.multiple || await iOpenToggle.close(this, ...args)) {
			if (this.block != null) {
				const markedEl = this.block.element('item', {marked: true});

				if (markedEl != null) {
					this.block.removeElementMod(markedEl, 'item', 'marked');
				}
			}

			return true;
		}

		return false;
	}

	/**
	 * {@link SelectEventHandlers.prototype.onItemClick}
	 * @see https://github.com/V4Fire/Client/issues/848
	 */
	@watch({
		path: '?$el:click',
		wrapper: (o, cb) => o.dom.delegateElement('item', (e: MouseEvent) => cb(e.delegateTarget))
	})

	onItemClick(itemEl: Nullable<Element>): void {
		SelectEventHandlers.onItemClick(this, itemEl);
	}

	/** {@link iOpenToggle.prototype.onKeyClose} */
	async onKeyClose(e: KeyboardEvent): Promise<void> {
		if (e.key === 'Escape' || (e.key === 'Tab' && !this.isFocused)) {
			await this.close();
		}
	}

	/** {@link h.setScrollToMarkedOrSelectedItem} */
	protected setScrollToMarkedOrSelectedItem(): Promise<boolean> {
		return h.setScrollToMarkedOrSelectedItem.call(this);
	}

	protected override initBaseAPI(): void {
		super.initBaseAPI();

		const
			i = this.instance;

		this.normalizeItems = i.normalizeItems.bind(this);
	}

	/** {@link iOpenToggle.initCloseHelpers} */
	@hook('beforeDataCreate')
	protected initCloseHelpers(events?: CloseHelperEvents): void {
		iOpenToggle.initCloseHelpers(this, events, {capture: true});
	}

	/** {@link Values.init} */
	@hook('beforeDataCreate')
	protected initComponentValues(): void {
		this.values.init();
	}

	/** {@link h.normalizeItems} */
	protected normalizeItems(items: CanUndef<this['Items']>): this['Items'] {
		return h.normalizeItems(items);
	}

	protected override normalizeAttrs(attrs: Dictionary = {}): Dictionary {
		attrs = super.normalizeAttrs(attrs);

		if (this.native) {
			attrs.multiple = this.multiple;
		}

		return attrs;
	}

	/**
	 * Returns a dictionary with props for the specified item
	 *
	 * @param item
	 * @param i - position index
	 */
	protected getItemProps(item: this['Item'], i: number): Dictionary {
		const
			op = this.itemProps;

		return Object.isFunction(op) ?
			op(item, i, {
				key: this.getItemKey(item, i),
				ctx: this
			}) :

			op ?? {};
	}

	/** {@link iItems.getItemKey} */
	protected getItemKey(item: this['Item'], i: number): CanUndef<IterationKey> {
		return iItems.getItemKey(this, item, i);
	}

	/**
	 * Synchronization of items
	 *
	 * @param items
	 * @param [oldItems]
	 * @emits `itemsChange(value: this['Items'])`
	 */
	@watch('itemsStore')
	protected syncItemsWatcher(items: this['Items'], oldItems?: this['Items']): void {
		if (!Object.fastCompare(items, oldItems)) {
			this.initComponentValues();
			this.emit('itemsChange', items);
		}
	}

	protected override updateTextStore(value: string): void {
		this.field.set('textStore', value);

		const {input} = this.$refs;

		// Sync value of the <input /> with the text
		if (!this.native && Object.isTruly(input)) {
			input.value = value;
		}
	}

	protected override initModEvents(): void {
		super.initModEvents();
		this.sync.mod('native', 'native', Boolean);
		this.sync.mod('multiple', 'multiple', Boolean);
		this.sync.mod('opened', 'multiple', Boolean);
	}

	protected override initValueListeners(): void {
		super.initValueListeners();

		this.localEmitter.on('maskedText.change', () => {
			this.onTextChange();
		});
	}

	protected override beforeDestroy(): void {
		super.beforeDestroy();

		if (openedSelect.link === this) {
			openedSelect.link = null;
		}
	}

	protected override onFocus(): void {
		super.onFocus();
		void this.open();
	}

	protected override mounted(): void {
		super.mounted();

		// Restore event handlers for functional components
		if (this.isFunctional && this.keydownHandlerEnabled) {
			this.handleKeydown(true);
		}
	}
}

export default bSelect;
