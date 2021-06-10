/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import symbolGenerator from 'core/symbol';
import SyncPromise from 'core/promise/sync';
import { derive } from 'core/functools/trait';

import iItems, { IterationKey } from 'traits/i-items/i-items';
import iOpenToggle from 'traits/i-open-toggle/i-open-toggle';

import iInputText, {

	component,
	prop,
	field,
	system,
	computed,
	hook,

	ModsDecl, watch

} from 'super/i-input-text/i-input-text';

import type { Value, FormValue, Item, Items } from 'form/b-select/interface';

export * from 'form/b-input/b-input';
export * from 'traits/i-open-toggle/i-open-toggle';
export * from 'form/b-select/interface';

export { Value, FormValue };

export const
	$$ = symbolGenerator();

interface bSelect extends Trait<typeof iOpenToggle> {}

@component({
	model: {
		prop: 'selectedProp',
		event: 'onChange'
	}
})

@derive(iOpenToggle)
class bSelect extends iInputText implements iOpenToggle, iItems {
	/** @override */
	readonly Value!: Value;

	/** @override */
	readonly FormValue!: FormValue;

	/** @see [[iItems.Item]] */
	readonly Item!: Item;

	/** @see [[iItems.Items]] */
	readonly Items!: Array<this['Item']>;

	/** @see [[iItems.items]] */
	@prop(Array)
	readonly itemsProp: this['Items'] = [];

	/** @see [[iItems.item]] */
	@prop({type: [String, Function], required: false})
	readonly item?: iItems['item'];

	/** @see [[iItems.itemKey]] */
	@prop({
		type: [String, Function],
		default: () => (item: Item) => item.value
	})

	readonly itemKey!: iItems['itemKey'];

	/** @see [[iItems.itemProps]] */
	@prop({type: Function, required: false})
	readonly itemProps?: iItems['itemProps'];

	/**
	 * If true, the component supports a feature of multiple selected items
	 */
	@prop(Boolean)
	readonly multiple: boolean = false;

	/**
	 * Icon to show before the input
	 *
	 * @example
	 * ```
	 * < b-select :preIcon = 'dropdown' | :items = myItems
	 * ```
	 */
	@prop({type: String, required: false})
	readonly preIcon?: string;

	/**
	 * Name of the used component to show `preIcon`
	 *
	 * @default `'b-icon'`
	 * @example
	 * ```
	 * < b-select :preIconComponent = 'b-my-icon' | :items = myItems
	 * ```
	 */
	@prop({type: String, required: false})
	readonly preIconComponent?: string;

	/**
	 * Tooltip text to show during hover the cursor on `preIcon`
	 *
	 * @example
	 * ```
	 * < b-select :preIcon = 'dropdown' | :preIconHint = 'Show variants' | :items = myItems
	 * ```
	 */
	@prop({type: String, required: false})
	readonly preIconHint?: string;

	/**
	 * Tooltip position to show during hover the cursor on `preIcon`
	 *
	 * @see [[gHint]]
	 * @example
	 * ```
	 * < b-select &
	 *   :preIcon = 'dropdown' |
	 *   :preIconHint = 'Show variants' |
	 *   :preIconHintPos = 'bottom-right' |
	 *   :items = myItems
	 * .
	 * ```
	 */
	@prop({type: String, required: false})
	readonly preIconHintPos?: string;

	/**
	 * Icon to show after the input
	 *
	 * @example
	 * ```
	 * < b-select :icon = 'dropdown' | :items = myItems
	 * ```
	 */
	@prop({type: String, required: false})
	readonly icon?: string;

	/**
	 * Name of the used component to show `icon`
	 *
	 * @default `'b-icon'`
	 * @example
	 * ```
	 * < b-select :iconComponent = 'b-my-icon' | :items = myItems
	 * ```
	 */
	@prop({type: String, required: false})
	readonly iconComponent?: string;

	/**
	 * Tooltip text to show during hover the cursor on `icon`
	 *
	 * @example
	 * ```
	 * < b-select :icon = 'dropdown' | :iconHint = 'Show variants' | :items = myItems
	 * ```
	 */
	@prop({type: String, required: false})
	readonly iconHint?: string;

	/**
	 * Tooltip position to show during hover the cursor on `icon`
	 *
	 * @see [[gHint]]
	 * @example
	 * ```
	 * < b-select &
	 *   :icon = 'dropdown' |
	 *   :iconHint = 'Show variants' | :
	 *   :iconHintPos = 'bottom-right' |
	 *   :items = myItems
	 * .
	 * ```
	 */
	@prop({type: String, required: false})
	readonly iconHintPos?: string;

	/**
	 * A component to show "in-progress" state or
	 * Boolean, if need to show progress by slot or `b-progress-icon`
	 *
	 * @default `'b-progress-icon'`
	 * @example
	 * ```
	 * < b-select :progressIcon = 'b-my-progress-icon'
	 * ```
	 */
	@prop({type: [String, Boolean], required: false})
	readonly progressIcon?: string | boolean;

	/** @override */
	get value(): this['Value'] {
		const
			v = this.field.get('valueStore');

		if (this.multiple) {
			return Object.isSet(v) ? new Set(v) : new Set();
		}

		return v;
	}

	/**
	 * List of component items or select options
	 * @see [[bSelect.itemsProp]]
	 */
	get items(): this['Items'] {
		return <this['Items']>this.field.get('itemsStore');
	}

	/**
	 * Sets a new list of component items
	 * @see [[bSelect.items]]
	 */
	set items(value: this['Items']) {
		this.field.set('itemsStore', value);
	}

	/** @inheritDoc */
	static readonly mods: ModsDecl = {
		opened: [
			...iOpenToggle.mods.opened!,
			['false']
		]
	};

	/** @override */
	@system<bSelect>((o) => o.sync.link((val) => {
		const
			beforeDataCreate = o.hook === 'beforeDataCreate';

		if (val === undefined && beforeDataCreate) {
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

		void o.selectValue(newVal);
		return newVal;
	}))

	protected valueStore!: this['Value'];

	/**
	 * Map of item indexes and their values
	 */
	@system()
	protected indexes!: Dictionary<this['Item']>;

	/**
	 * Map of item values and their indexes
	 */
	@system()
	protected values!: Map<unknown, number>;

	/**
	 * Store of component items
	 * @see [[bSelect.items]]
	 */
	@field<bSelect>((o) => o.sync.link<Items>((val) => {
		if (o.dataProvider != null) {
			return <CanUndef<Items>>o.itemsStore ?? [];
		}

		return o.normalizeItems(val);
	}))

	protected itemsStore!: this['Items'];

	/** @override */
	protected readonly $refs!: iInputText['$refs'] & {
		select?: HTMLSelectElement;
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

	protected get selectedElement(): CanPromise<CanUndef<CanArray<HTMLAnchorElement>>> {
		const
			{value} = this;

		const getEl = (value) => {
			const
				id = this.values.get(value);

			if (id != null) {
				return this.block?.element<HTMLAnchorElement>('item', {id});
			}
		};

		return this.waitStatus('ready', () => {
			if (this.multiple) {
				if (!Object.isSet(value)) {
					return [];
				}

				return [...value].flatMap((val) => getEl(val) ?? []);
			}

			return getEl(value);
		});
	}

	/**
	 * Selects the specified value
	 * @param value
	 */
	async selectValue(value: unknown): Promise<boolean> {
		const
			valueStore = this.field.get('valueStore');

		if (this.multiple) {
			if (Object.has(valueStore, [value])) {
				return false;
			}

			(<Set<unknown>>valueStore).add(value);

		} else if (valueStore === value) {
			return false;

		} else {
			this.field.set('valueStore', Object.freeze(value));
		}

		try {
			const
				dropdown = await this.waitRef<HTMLDivElement>('dropdown', {label: $$.dropdown});

			const
				{block: $b} = this;

			if ($b == null) {
				return true;
			}

			const
				id = this.values.get(value),
				target = id != null ? $b.element<HTMLDivElement>('item', {id}) : null;

			if (!this.multiple) {
				const
					old = $b.element('item', {selected: true});

				if (old != null && old !== target) {
					$b.setElMod(old, 'item', 'selected', false);
				}

				if (target != null) {
					const
						{clientHeight, scrollTop} = dropdown,
						{offsetTop: itemOffset} = target;

					if (itemOffset > clientHeight + scrollTop || itemOffset - target.clientHeight < scrollTop) {
						dropdown.scrollTop = itemOffset - clientHeight / 2;
					}
				}
			}

		} catch {}

		return true;
	}

	/**
	 * Removes selection from the specified value
	 * @param value
	 */
	unselectValue(value: unknown): Promise<boolean> {
		const
			valueStore = this.field.get('valueStore');

		if (this.multiple) {
			if (!Object.has(valueStore, [value])) {
				return SyncPromise.resolve(false);
			}

			(<Set<unknown>>valueStore).delete(value);

		} else if (valueStore !== value) {
			return SyncPromise.resolve(false);

		} else {
			this.field.set('valueStore', undefined);
		}

		const
			{block: $b} = this;

		if ($b) {
			const
				id = this.values.get(value),
				target = id != null ? $b.element('item', {id}) : null;

			if (target) {
				$b.setElMod(target, 'item', 'selected', false);
			}
		}

		return SyncPromise.resolve(true);
	}

	/**
	 * Toggles selection of the specified value
	 * @param value
	 */
	toggleValue(value: unknown): Promise<boolean> {
		const
			valueStore = this.field.get('valueStore');

		if (this.multiple) {
			if (Object.has(valueStore, [value])) {
				return this.unselectValue(value);
			}

			return this.selectValue(value);
		}

		if (valueStore !== value) {
			return this.selectValue(value);
		}

		return this.unselectValue(value);
	}

	/** @override */
	protected initBaseAPI(): void {
		super.initBaseAPI();

		const
			i = this.instance;

		this.normalizeItems = i.normalizeItems.bind(this);
		this.isSelected = i.isSelected.bind(this);
		this.selectValue = i.selectValue.bind(this);
	}

	/**
	 * Returns true if the specified item is selected
	 * @param item
	 */
	protected isSelected(item: Item): boolean {
		const v = this.field.get('valueStore');
		return this.multiple ? Object.has(v, [item.value]) : item.value === v;
	}

	/**
	 * Initializes component values
	 */
	@hook('beforeDataCreate')
	protected initComponentValues(): void {
		const
			values = new Map(),
			indexes = {};

		const
			valueStore = this.field.get('valueStore');

		for (let i = 0; i < this.items.length; i++) {
			const
				item = this.items[i],
				val = item.value;

			if (item.selected && (this.multiple ? this.valueProp === undefined : valueStore === undefined)) {
				void this.selectValue(val);
			}

			values.set(val, i);
			indexes[i] = item;
		}

		this.values = values;
		this.indexes = indexes;
	}

	/**
	 * Normalizes the specified items and returns it
	 * @param items
	 */
	protected normalizeItems(items: CanUndef<this['Items']>): this['Items'] {
		const
			res = <this['Items']>[];

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

	/**
	 * Handler: click to some item element
	 *
	 * @param e
	 * @emits `actionChange(value: V)`
	 */
	@watch({
		field: '?$el:click',
		wrapper: (o, cb) => o.dom.delegateElement('item', cb)
	})

	protected onItemClick(e: Event): void {
		const
			target = <Element>e.delegateTarget,
			id = Number(target.getAttribute('data-id')),
			item = this.indexes[id];

		if (item == null) {
			return;
		}

		if (!this.multiple) {
			this.text = item.label ?? '';
		}

		this.toggleValue(item.value)
			.then(() => this.emit('actionChange', this.value))
			.catch(stderr);
	}

	/**
	 * Handler: changing of the input' text value
	 */
	@watch('text')
	protected onTextChange(): void {
		const
			rgxp = new RegExp(`^${RegExp.escape(this.text)}`, 'i');

		let
			some = false;

		for (let i = 0; i < this.items.length; i++) {
			const
				item = this.items[i];

			if (item.label != null && rgxp.test(item.label)) {
				void this.selectValue(item.value);
				some = true;
				break;
			}
		}

		if (some) {
			void this.open();
		}

		void this.close();
	}

	/**
	 * Handler: manual editing of a component text value
	 *
	 * @param e
	 * @emits `actionChange(value: V)`
	 */
	protected onEdit(e: InputEvent): void {
		const
			target = <HTMLInputElement>e.target;

		if (this.compiledMask != null) {
			return;
		}

		const val = this.value;
		this.field.set('textStore', target.value);

		if (val !== this.value) {
			this.emit('actionChange', this.value);
		}
	}
}

export default bSelect;
