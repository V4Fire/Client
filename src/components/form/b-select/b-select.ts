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

import Block, { setElementMod, removeElementMod } from 'components/friends/block';

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
	ModEvent,
	SetModEvent,

	UnsafeGetter,
	ValidatorsDecl,
	ValidatorParams,
	ValidatorResult

} from 'components/super/i-input-text/i-input-text';
import Mask, * as MaskAPI from 'components/super/i-input-text/mask';

import * as on from 'components/form/b-select/modules/handlers';
import { normalizeItems, getSelectedElement, setScrollToMarkedOrSelectedItem } from 'components/form/b-select/modules/helpers';

import { openedSelect } from 'components/form/b-select/const';

import type {

	Value,
	FormValue,

	Items,
	UnsafeBSelect

} from 'components/form/b-select/interface';

import bSelectProps from 'components/form/b-select/props';
import Values from 'components/form/b-select/modules/values';

export * from 'components/form/b-input/b-input';
export * from 'components/traits/i-open-toggle/i-open-toggle';

export * from 'components/form/b-select/const';
export * from 'components/form/b-select/interface';

export { Value, FormValue };

Block.addToPrototype({setElementMod, removeElementMod});
Mask.addToPrototype(MaskAPI);

interface bSelect extends Trait<typeof iOpenToggle>, Trait<typeof iActiveItems> {}

@component()
@derive(iOpenToggle, iActiveItems)
class bSelect extends bSelectProps implements iOpenToggle, iActiveItems {
	override get unsafe(): UnsafeGetter<UnsafeBSelect<this>> {
		return Object.cast(this);
	}

	/** @see [[bSelectProps.itemsProp]] */
	get items(): this['Items'] {
		return <this['Items']>this.field.get('itemsStore');
	}

	/** @see [[bSelect.items]] */
	set items(value: this['Items']) {
		this.field.set('itemsStore', value);
	}

	/** @see [[iActiveItems.activeChangeEvent]] */
	@system()
	readonly activeChangeEvent: string = 'change';

	/** @see [[iActiveItems.active]] */
	@computed({cache: false})
	get active(): this['Active'] {
		return iActiveItems.getActive(this);
	}

	/** @see [[iActiveItems.activeElement]] */
	get activeElement(): CanPromise<CanNull<CanArray<HTMLOptionElement>>> {
		return getSelectedElement(this);
	}

	/**
	 * @see [[iActiveItems.activeStore]]
	 * @see [[iActiveItems.syncActiveStore]]
	 */
	@system<bSelect>((o) => {
		o.watch('valueProp', (val) => o.setActive(val, true));
		o.watch('modelValue', (val) => o.setActive(val, true));
		return iActiveItems.linkActiveStore(o, (val) => o.resolveValue(o.valueProp ?? o.modelValue ?? val));
	})

	activeStore!: iActiveItems['activeStore'];

	@computed({cache: false})
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

		if (!this.multiple) {
			const item = this.values.getItemByValue(value);
			this.text = item?.label ?? '';
		}
	}

	override get default(): this['Active'] {
		const val = this.field.get('defaultProp');

		if (this.multiple) {
			return new Set(Object.isIterable(val) ? val : Array.concat([], val));
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
	@system<bSelect>((o) => new Values(o))
	protected values!: Values;

	/** @see [[bSelect.items]] */
	@field<bSelect>((o) => o.sync.link<Items>((val) => {
		if (o.dataProvider != null) {
			return <CanUndef<Items>>o.itemsStore ?? [];
		}

		return o.normalizeItems(val);
	}))

	protected itemsStore!: this['Items'];

	protected override readonly $refs!: iInputText['$refs'] & {
		dropdown?: Element;
	};

	/** @see [[iActiveItems.activeElement]] */
	@computed({cache: false})
	protected get selectedElement(): CanPromise<CanNull<CanArray<HTMLOptionElement>>> {
		return this.activeElement;
	}

	/**
	 * Handler: changing value of the component helper input
	 */
	@computed({cache: true})
	protected get onTextChange(): Function {
		return this.async.debounce(on.textChange.bind(null, this), 200);
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

	/** @see [[iActiveItems.setActive]] */
	setActive(value: this['ActiveProp'], unsetPrevious: boolean = false): boolean {
		if (!iActiveItems.setActive(this, value, unsetPrevious)) {
			return false;
		}

		const
			{block: $b} = this;

		if ($b == null) {
			return true;
		}

		const
			id = this.values.getIndex(value),
			itemEl = id != null ? $b.element<HTMLOptionElement>('item', {id}) : null;

		if (!this.multiple || unsetPrevious) {
			const
				previousItemEls = $b.elements<HTMLOptionElement>('item', {selected: true});

			for (let i = 0; i < previousItemEls.length; i++) {
				const
					previousItemEl = previousItemEls[i];

				// TODO: create helper
				if (previousItemEl !== itemEl) {
					$b.setElementMod(previousItemEl, 'item', 'selected', false);

					if (this.native) {
						previousItemEl.selected = false;

					} else {
						previousItemEl.setAttribute('aria-selected', 'false');
					}
				}
			}
		}

		SyncPromise.resolve(this.activeElement).then((el) => {
			const
				els = Array.concat([], el);

			for (let i = 0; i < els.length; i++) {
				const el = els[i];

				// TODO: create helper
				$b.setElementMod(el, 'item', 'selected', true);

				if (this.native) {
					el.selected = true;

				} else {
					el.setAttribute('aria-selected', 'true');
				}
			}
		}).catch(stderr);

		return true;
	}

	/** @see [[iActiveItems.unsetActive]] */
	unsetActive(value: this['ActiveProp']): boolean {
		if (!iActiveItems.unsetActive(this, value)) {
			return false;
		}

		const
			{block: $b} = this;

		if ($b == null) {
			return true;
		}

		SyncPromise.resolve(this.activeElement).then((el) => {
			const
				els = Array.concat([], el);

			for (let i = 0; i < els.length; i++) {
				const
					el = els[i],
					id = el.getAttribute('data-id'),
					item = this.values.getItem(id ?? -1);

				if (item == null) {
					continue;
				}

				const needChangeMod = this.multiple && Object.isSet(value) ?
					value.has(item.value) :
					value === item.value;

				// TODO: create helper
				if (needChangeMod) {
					$b.setElementMod(el, 'item', 'selected', false);

					if (this.native) {
						el.selected = false;

					} else {
						el.setAttribute('aria-selected', 'false');
					}
				}
			}
		}).catch(stderr);

		return true;
	}

	/** @see [[iActiveItems.isActive]] */
	isSelected(value: unknown): boolean {
		return this.isActive(value);
	}

	/** @see [[iActiveItems.setActive]] */
	selectValue(value: this['ActiveProp'], unselectPrevious: boolean = false): boolean {
		return this.setActive(value, unselectPrevious);
	}

	/** @see [[iActiveItems.unsetActive]] */
	unselectValue(value: this['ActiveProp']): boolean {
		return this.unsetActive(value);
	}

	/** @see [[iActiveItems.toggleActive]] */
	toggleValue(value: this['ActiveProp'], unselectPrevious: boolean = false): CanUndef<this['Active']> {
		const val = this.toggleActive(value, unselectPrevious);

		if (this.multiple && Object.isSet(val) && val.size === 0) {
			return undefined;
		}

		return val;
	}

	/** @see [[iOpenToggle.open]] */
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

	/** @see [[iOpenToggle.open]] */
	async close(...args: unknown[]): Promise<boolean> {
		if (this.native) {
			return false;
		}

		if (this.multiple || await iOpenToggle.close(this, ...args)) {
			const
				{block: $b} = this;

			if ($b != null) {
				const
					markedEl = $b.element('item', {marked: true});

				if (markedEl != null) {
					$b.removeElementMod(markedEl, 'item', 'marked');
				}
			}

			return true;
		}

		return false;
	}

	/** @see [[iOpenToggle.onOpenedChange]] */
	// eslint-disable-next-line @typescript-eslint/require-await
	async onOpenedChange(e: ModEvent | SetModEvent): Promise<void> {
		await on.openedChange(this, e);
	}

	/**
	 * Sets the scroll position to the first marked or selected item
	 */
	protected setScrollToMarkedOrSelectedItem(): Promise<boolean> {
		return setScrollToMarkedOrSelectedItem(this);
	}

	protected override initBaseAPI(): void {
		super.initBaseAPI();

		const
			i = this.instance;

		this.normalizeItems = i.normalizeItems.bind(this);
	}

	/** @see [[iOpenToggle.initCloseHelpers]] */
	@hook('beforeDataCreate')
	protected initCloseHelpers(events?: CloseHelperEvents): void {
		iOpenToggle.initCloseHelpers(this, events);
	}

	/** @see [[Values.init]] */
	@hook('beforeDataCreate')
	protected initComponentValues(): void {
		this.values.init();
	}

	/** @see [[normalizeItems]] */
	protected normalizeItems(items: CanUndef<this['Items']>): this['Items'] {
		return normalizeItems(items);
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

	/** @see [[iItems.getItemKey]] */
	protected getItemKey(item: this['Item'], i: number): CanUndef<IterationKey> {
		return iItems.getItemKey(this, item, i);
	}

	/**
	 * Synchronization of items
	 *
	 * @param items
	 * @param oldItems
	 * @emits `itemsChange(value: this['Items'])`
	 */
	@watch('itemsStore')
	protected syncItemsWatcher(items: this['Items'], oldItems: this['Items']): void {
		if (!Object.fastCompare(items, oldItems)) {
			this.initComponentValues();
			this.emit('itemsChange', items);
		}
	}

	protected override initModEvents(): void {
		super.initModEvents();
		this.sync.mod('native', 'native', Boolean);
		this.sync.mod('multiple', 'multiple', Boolean);
		this.sync.mod('opened', 'multiple', Boolean);
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

	/**
	 * Handler: clearing of a component value
	 * @emits `actionChange(value: this['Active'])`
	 */
	protected async onClear(): Promise<void> {
		if (await this.clear()) {
			this.emit('actionChange', this.value);
		}
	}

	/**
	 * Handler: value changing of a native component `<select>`
	 * @emits `actionChange(value: this['Active'])`
	 */
	protected onNativeChange(): void {
		on.nativeChange(this);
	}

	protected override initValueListeners(): void {
		this.watch('activeStore', (value: this['Value'], oldValue: CanUndef<this['Value']>) => {
			this.prevValue = oldValue;

			if (value !== oldValue || value != null && typeof value === 'object') {
				this.$emit('update:modelValue', this.value);
			}
		});

		this.localEmitter.on('maskedText.change', () => {
			this.onTextChange();
		});
	}

	/**
	 * Handler: typing text into a helper text input to search select options
	 *
	 * @param e
	 * @emits `actionChange(value: this['Active'])`
	 */
	protected onSearchInput(e: InputEvent): void {
		on.searchInput(this, e);
	}

	/**
	 * Handler: click to some item element
	 *
	 * @param itemEl
	 * @emits `actionChange(value: this['Active'])`
	 */
	@watch({
		path: '?$el:click',
		wrapper: (o, cb) => o.dom.delegateElement('item', (e: MouseEvent) => cb(e.delegateTarget))
	})

	protected onItemClick(itemEl: CanUndef<Element>): void {
		on.itemClick(this, itemEl);
	}

	/**
	 * Handler: "navigation" over the select via "arrow" buttons
	 * @param e
	 */
	protected onItemsNavigate(e: KeyboardEvent): void {
		void on.itemsNavigate(this, e);
	}
}

export default bSelect;
