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
import * as h from 'components/form/b-select/modules/helpers';

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

interface bSelect extends Trait<typeof iOpenToggle> {}

@component()
@derive(iOpenToggle)
class bSelect extends bSelectProps implements iOpenToggle, iItems {
	/** @see [[bSelect.itemsProp]] */
	get items(): this['Items'] {
		return <this['Items']>this.field.get('itemsStore');
	}

	/** @see [[bSelect.items]] */
	set items(value: this['Items']) {
		this.field.set('itemsStore', value);
	}

	override get unsafe(): UnsafeGetter<UnsafeBSelect<this>> {
		return Object.cast(this);
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

	override get value(): this['Value'] {
		const
			v = this.field.get('valueStore');

		if (this.multiple) {
			if (Object.isSet(v) && v.size > 0) {
				return new Set(v);
			}

			return undefined;
		}

		return v;
	}

	override set value(value: this['Value']) {
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

	override get default(): this['Value'] {
		const
			val = this.field.get('defaultProp');

		if (this.multiple) {
			return new Set(Object.isSet(val) ? val : Array.concat([], val));
		}

		return val;
	}

	override get formValue(): Promise<this['FormValue']> {
		const
			formValue = super['formValueGetter']();

		return (async () => {
			const
				val = await formValue;

			if (this.multiple && Object.isSet(val)) {
				return [...val];
			}

			return val;
		})();
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

	@system<bSelect>((o) => o.sync.link((val) => {
		val = o.resolveValue(val);

		if (val === undefined && o.hook === 'beforeDataCreate') {
			if (o.multiple) {
				if (Object.isSet(o.valueStore)) {
					return o.valueStore;
				}

				return new Set(Array.concat([], o.valueStore));
			}

			return o.valueStore;
		}

		let
			newVal;

		if (o.multiple) {
			const
				objVal = new Set(Object.isSet(val) ? val : Array.concat([], val));

			if (Object.fastCompare(objVal, o.valueStore)) {
				return o.valueStore;
			}

			newVal = objVal;

		} else {
			newVal = val;
		}

		o.selectValue(newVal);
		return newVal;
	}))

	protected override valueStore!: this['Value'];

	/** @see [[bSelect.items]] */
	@field<bSelect>((o) => o.sync.link<Items>((val) => {
		if (o.dataProvider != null) {
			return <CanUndef<Items>>o.itemsStore ?? [];
		}

		return o.normalizeItems(val);
	}))

	protected itemsStore!: this['Items'];

	/**
	 * Internal API for working with component values
	 */
	@system<bSelect>((o) => new Values(o))
	protected values!: Values;

	protected override readonly $refs!: iInputText['$refs'] & {
		dropdown?: Element;
	};

	/**
	 * A link to the selected item element.
	 * If the component is switched to the `multiple` mode, the getter will return an array of elements.
	 */
	@computed({
		cache: true,
		dependencies: ['value']
	})

	protected get selectedElement(): CanPromise<CanUndef<CanArray<HTMLOptionElement>>> {
		return h.getSelectedElement(this);
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

	/**
	 * Returns true if the specified value is selected
	 * @param value
	 */
	isSelected(value: unknown): boolean {
		const
			valueStore = this.field.get('valueStore');

		if (this.multiple) {
			if (!Object.isSet(valueStore)) {
				return false;
			}

			return valueStore.has(value);
		}

		return value === valueStore;
	}

	/**
	 * Selects an item by the specified value.
	 * If the component is switched to the `multiple` mode, the method can take a `Set` object to set multiple items.
	 *
	 * @param value
	 * @param [unselectPrevious] - true, if needed to unselect previous selected items
	 *   (works only with the `multiple` mode)
	 */
	selectValue(value: this['Value'], unselectPrevious: boolean = false): boolean {
		const
			valueStore = this.field.get('valueStore');

		if (this.multiple) {
			if (!Object.isSet(valueStore)) {
				return false;
			}

			if (unselectPrevious) {
				valueStore.clear();
			}

			let
				res = false;

			const set = (value) => {
				if (valueStore.has(value)) {
					return false;
				}

				valueStore.add(value);
				res = true;
			};

			if (Object.isSet(value)) {
				Object.forEach(value, set);

			} else {
				set(value);
			}

			// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
			if (!res) {
				return false;
			}

		} else if (valueStore === value) {
			return false;

		} else {
			this.field.set('valueStore', value);
		}

		const
			{block: $b} = this;

		if ($b == null) {
			return true;
		}

		const
			id = this.values.getIndex(value),
			itemEl = id != null ? $b.element<HTMLOptionElement>('item', {id}) : null;

		if (!this.multiple || unselectPrevious) {
			const
				previousItemEls = $b.elements<HTMLOptionElement>('item', {selected: true});

			for (let i = 0; i < previousItemEls.length; i++) {
				const
					previousItemEl = previousItemEls[i];

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

		SyncPromise.resolve(this.selectedElement).then((selectedElement) => {
			const
				els = Array.concat([], selectedElement);

			for (let i = 0; i < els.length; i++) {
				const el = els[i];
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

	/**
	 * Removes selection from an item by the specified value.
	 * If the component is switched to the `multiple` mode, the method can take a `Set` object to unset multiple items.
	 *
	 * @param value
	 */
	unselectValue(value: this['Value']): boolean {
		const
			valueStore = this.field.get('valueStore');

		const
			{selectedElement} = this;

		if (this.multiple) {
			if (!Object.isSet(valueStore)) {
				return false;
			}

			let
				res = false;

			const unset = (value) => {
				if (!valueStore.has(value)) {
					return;
				}

				valueStore.delete(value);
				res = true;
			};

			if (Object.isSet(value)) {
				Object.forEach(value, unset);

			} else {
				unset(value);
			}

			// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
			if (!res) {
				return false;
			}

		} else if (valueStore !== value) {
			return false;

		} else {
			this.field.set('valueStore', undefined);
		}

		const
			{block: $b} = this;

		if ($b == null) {
			return true;
		}

		SyncPromise.resolve(selectedElement).then((selectedElement) => {
			const
				els = Array.concat([], selectedElement);

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

	/**
	 * Toggles selection of an item by the specified value.
	 * The methods return a new selected value/s.
	 *
	 * @param value
	 * @param [unselectPrevious] - true, if needed to unselect previous selected items
	 *   (works only with the `multiple` mode)
	 */
	toggleValue(value: this['Value'], unselectPrevious: boolean = false): this['Value'] {
		const
			valueStore = this.field.get('valueStore');

		if (this.multiple) {
			if (!Object.isSet(valueStore)) {
				return this.value;
			}

			const toggle = (value) => {
				if (valueStore.has(value)) {
					if (unselectPrevious) {
						this.unselectValue(this.value);

					} else {
						this.unselectValue(value);
					}

					return;
				}

				this.selectValue(value, unselectPrevious);
			};

			if (Object.isSet(value)) {
				Object.forEach(value, toggle);

			} else {
				toggle(value);
			}

		} else if (valueStore !== value) {
			this.selectValue(value);

		} else {
			this.unselectValue(value);
		}

		return this.value;
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
		return h.setScrollToMarkedOrSelectedItem(this);
	}

	protected override initBaseAPI(): void {
		super.initBaseAPI();

		const
			i = this.instance;

		this.normalizeItems = i.normalizeItems.bind(this);
		this.selectValue = i.selectValue.bind(this);
	}

	/** @see [[iOpenToggle.initCloseHelpers]] */
	@hook('beforeDataCreate')
	protected initCloseHelpers(events?: CloseHelperEvents): void {
		iOpenToggle.initCloseHelpers(this, events);
	}

	/**
	 * Initializes component values
	 */
	@hook('beforeDataCreate')
	protected initComponentValues(): void {
		this.values.init();
	}

	/**
	 * Normalizes the specified items and returns it
	 * @param items
	 */
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
	 * @emits `actionChange(value: this['Value'])`
	 */
	protected async onClear(): Promise<void> {
		if (await this.clear()) {
			this.emit('actionChange', this.value);
		}
	}

	/**
	 * Handler: value changing of a native component `<select>`
	 * @emits `actionChange(value: this['Value'])`
	 */
	protected onNativeChange(): void {
		on.nativeChange(this);
	}

	protected override initValueListeners(): void {
		super.initValueListeners();

		this.localEmitter.on('maskedText.change', () => {
			this.onTextChange();
		});
	}

	/**
	 * Handler: typing text into a helper text input to search select options
	 *
	 * @param e
	 * @emits `actionChange(value: this['Value'])`
	 */
	protected onSearchInput(e: InputEvent): void {
		on.searchInput(this, e);
	}

	/**
	 * Handler: click to some item element
	 *
	 * @param itemEl
	 * @emits `actionChange(value: this['Value'])`
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
