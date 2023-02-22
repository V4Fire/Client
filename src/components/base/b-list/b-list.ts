/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:components/base/b-list/README.md]]
 * @packageDocumentation
 */

import SyncPromise from 'core/promise/sync';
import { isAbsURL } from 'core/url';

import DOM, { delegateElement } from 'components/friends/dom';
import Block, { element, elements } from 'components/friends/block';

import iVisible from 'components/traits/i-visible/i-visible';
import iWidth from 'components/traits/i-width/i-width';
import iItems, { IterationKey } from 'components/traits/i-items/i-items';

import iData, { component, prop, field, system, computed, hook, watch, ModsDecl } from 'components/super/i-data/i-data';
import type { Active, Item, Items } from 'components/base/b-list/interface';

export * from 'components/super/i-data/i-data';
export * from 'components/base/b-list/interface';

DOM.addToPrototype({delegateElement});
Block.addToPrototype({element, elements});

@component({
	functional: {
		dataProvider: undefined,
		vModel: undefined
	}
})

export default class bList extends iData implements iVisible, iWidth, iItems {
	/**
	 * Type: the active item
	 */
	readonly Active!: Active;

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
	@prop({type: [String, Function], required: false})
	readonly itemKey?: iItems['itemKey'];

	/** @see [[iItems.itemProps]] */
	@prop({type: Function, required: false})
	readonly itemProps?: iItems['itemProps'];

	/** @see [[iVisible.hideIfOffline]] */
	@prop(Boolean)
	readonly hideIfOffline: boolean = false;

	/**
	 * List root tag type
	 */
	@prop(String)
	readonly listTag: string = 'ul';

	/**
	 * List element tag type
	 */
	@prop(String)
	readonly listElementTag: string = 'li';

	/**
	 * The active element(s) of the component.
	 * If the component is switched to "multiple" mode, you can pass in an iterable to define multiple active elements.
	 */
	@prop({required: false})
	readonly activeProp?: CanIter<unknown>;

	/** @see [[iInput.activeProp]] */
	@prop({required: false})
	readonly modelValue?: CanIter<unknown>;

	/**
	 * If true, then all items without the `href` option will automatically generate a link by using `value` and
	 * other props
	 */
	@prop(Boolean)
	readonly autoHref: boolean = false;

	/**
	 * If true, the component supports the multiple active items feature
	 */
	@prop(Boolean)
	readonly multiple: boolean = false;

	/**
	 * If set to true, the active item can be canceled by clicking it again.
	 * By default, if the component is switched to the `multiple` mode, this value is set to `true`,
	 * otherwise it is set to `false`.
	 */
	@prop({type: Boolean, required: false})
	readonly cancelable?: boolean;

	/**
	 * Additional attributes that are provided to the native list tag
	 */
	@prop({type: Object, required: false})
	readonly attrsProp?: Dictionary;

	/** @see [[bList.attrsProp]] */
	get attrs(): Dictionary {
		const
			attrs = {...this.attrsProp};

		if (this.items.some((el) => el.href === undefined)) {
			attrs.role = 'tablist';
			attrs['aria-multiselectable'] = this.multiple;
		}

		return attrs;
	}

	/**
	 * A list of the component items
	 * @see [[bList.itemsProp]]
	 */
	@computed({dependencies: ['value', 'itemsStore']})
	get items(): this['Items'] {
		return <this['Items']>this.field.get('itemsStore');
	}

	/**
	 * Sets a new list of the component items
	 * @see [[bList.items]]
	 */
	set items(value: this['Items']) {
		this.field.set('itemsStore', value);
	}

	/**
	 * The active element(s) of the component.
	 * If the component is switched to "multiple" mode, the getter will return a Set.
	 *
	 * @see [[bList.activeStore]]
	 */
	get active(): this['Active'] {
		const
			v = this.field.get('activeStore');

		if (this.multiple) {
			return Object.isSet(v) ? new Set(v) : new Set();
		}

		return v;
	}

	static override readonly mods: ModsDecl = {
		...iVisible.mods,
		...iWidth.mods,

		hideLabels: [
			'true',
			['false']
		]
	};

	/**
	 * A store of the component items
	 * @see [[bList.items]]
	 */
	@field<bList>((o) => o.sync.link<Items>((val) => {
		if (o.dataProvider != null) {
			return <CanUndef<Items>>o.itemsStore ?? [];
		}

		return o.normalizeItems(val);
	}))

	protected itemsStore!: this['Items'];

	/**
	 * A map of the item indexes and their values
	 */
	@system()
	protected indexes!: Dictionary;

	/**
	 * A map of the item values and their indexes
	 */
	@system()
	protected values!: Map<unknown, number>;

	/**
	 * The component internal active item store.
	 * If the component is switched to the `multiple` mode, the value is defined as a Set.
	 *
	 * @see [[bList.activeProp]]
	 * @emits `immediateChange(active: CanArray<unknown>)`
	 */
	@system<bList>((o) => {
		o.watch('modelValue', (val) => o.setActive(val, true));

		return o.sync.link((val) => {
			val = o.modelValue ?? val;

			const
				beforeDataCreate = o.hook === 'beforeDataCreate';

			if (val === undefined && beforeDataCreate) {
				if (o.multiple) {
					if (Object.isSet(o.activeStore)) {
						return o.activeStore;
					}

					return createSetFrom(o.activeStore);
				}

				return o.activeStore;
			}

			let
				newVal;

			if (o.multiple) {
				const
					activeStore = createSetFrom(val);

				if (Object.fastCompare(activeStore, o.activeStore)) {
					return o.activeStore;
				}

				newVal = activeStore;

			} else {
				newVal = val;
			}

			if (beforeDataCreate) {
				o.emit('immediateChange', o.multiple ? createSetFrom(newVal) : newVal);

			} else {
				o.setActive(newVal);
			}

			return newVal;

			function createSetFrom(value: unknown): Set<unknown> {
				return new Set(Object.isIterable(value) ? value : [value]);
			}
		});
	})

	protected activeStore!: this['Active'];

	/**
	 * Link(s) to the DOM element of the component active item.
	 * If the component is switched to the `multiple` mode, the getter will return a list of elements.
	 */
	@computed({
		cache: true,
		dependencies: ['active']
	})

	protected get activeElement(): CanPromise<CanNull<CanArray<HTMLAnchorElement>>> {
		const
			{active} = this;

		const getEl = (value) => {
			const
				id = this.values.get(value);

			if (id != null) {
				return this.block?.element<HTMLAnchorElement>('link', {id}) ?? null;
			}

			return null;
		};

		return this.waitComponentStatus('ready', () => {
			if (this.multiple) {
				return Object.isSet(active) ? [...active].flatMap((val) => getEl(val) ?? []) : [];
			}

			return getEl(active);
		});
	}

	/**
	 * Returns true if the specified value is active
	 * @param value
	 */
	isActive(value: unknown): boolean {
		const
			activeStore = this.field.get('activeStore');

		if (this.multiple) {
			if (!Object.isSet(activeStore)) {
				return false;
			}

			return activeStore.has(value);
		}

		return value === activeStore;
	}

	/**
	 * Activates the item(s) by the specified value(s).
	 * If the component is switched to the `multiple` mode, the method can take an iterable to set multiple items.
	 *
	 * @param value
	 * @param [unsetPrevious] - true, if needed to reset previous active items (only works in the `multiple` mode)
	 *
	 * @emits `change(active: CanArray<unknown>)`
	 * @emits `immediateChange(active: CanArray<unknown>)`
	 */
	setActive(value: CanIter<unknown>, unsetPrevious: boolean = false): boolean {
		const
			activeStore = this.field.get('activeStore');

		if (this.multiple) {
			if (!Object.isSet(activeStore)) {
				return false;
			}

			let
				res = false;

			const set = (value) => {
				if (activeStore.has(value)) {
					return;
				}

				activeStore.add(value);
				res = true;
			};

			if (Object.isIterable(value)) {
				Object.forEach(value, set);

			} else {
				set(value);
			}

			// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
			if (!res) {
				return false;
			}

		} else if (activeStore === value) {
			return false;

		} else {
			this.field.set('activeStore', value);
		}

		const
			{block: $b} = this;

		if ($b != null) {
			const
				id = this.values.get(value),
				linkEl = id != null ? $b.element('link', {id}) : null;

			if (!this.multiple || unsetPrevious) {
				const
					previousLinkEls = $b.elements('link', {active: true});

				for (let i = 0; i < previousLinkEls.length; i++) {
					const
						previousLinkEl = previousLinkEls[i];

					if (previousLinkEl !== linkEl) {
						$b.setElementMod(previousLinkEl, 'link', 'active', false);

						if (previousLinkEl.hasAttribute('aria-selected')) {
							previousLinkEl.setAttribute('aria-selected', 'false');
						}
					}
				}
			}

			SyncPromise.resolve(this.activeElement).then((selectedElement) => {
				const
					els = Array.concat([], selectedElement);

				for (let i = 0; i < els.length; i++) {
					const el = els[i];
					$b.setElementMod(el, 'link', 'active', true);

					if (el.hasAttribute('aria-selected')) {
						el.setAttribute('aria-selected', 'true');
					}
				}
			}, stderr);
		}

		this.emit('immediateChange', this.active);
		this.emit('change', this.active);
		this.$emit('update:modelValue', this.active);

		return true;
	}

	/**
	 * Deactivates the item(s) by the specified value(s).
	 * If the component is switched to the `multiple` mode, the method can take an iterable to unset multiple items.
	 *
	 * @param value
	 * @emits `change(active: unknown)`
	 * @emits `immediateChange(active: unknown)`
	 */
	unsetActive(value: CanIter<unknown>): boolean {
		const
			activeStore = this.field.get('activeStore');

		const
			{activeElement} = this;

		if (this.multiple) {
			if (!Object.isSet(activeStore)) {
				return false;
			}

			let
				res = false;

			const unset = (value) => {
				if (!activeStore.has(value) || this.cancelable === false) {
					return false;
				}

				activeStore.delete(value);
				res = true;
			};

			if (Object.isIterable(value)) {
				Object.forEach(value, unset);

			} else {
				unset(value);
			}

			// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
			if (!res) {
				return false;
			}

		} else if (activeStore !== value || this.cancelable !== true) {
			return false;

		} else {
			this.field.set('activeStore', undefined);
		}

		const
			{block: $b} = this;

		if ($b != null) {
			SyncPromise.resolve(activeElement).then((activeElement) => {
				const
					els = Array.concat([], activeElement);

				els.forEach((el) => {
					const
						id = el.getAttribute('data-id'),
						itemValue = this.indexes[String(id)];

					if (itemValue == null) {
						return;
					}

					const needChangeMod = this.multiple && Object.isSet(value) ?
						value.has(itemValue) :
						value === itemValue;

					if (needChangeMod) {
						$b.setElementMod(el, 'link', 'active', false);

						if (el.hasAttribute('aria-selected')) {
							el.setAttribute('aria-selected', 'false');
						}
					}
				});
			}, stderr);
		}

		this.emit('immediateChange', this.active);
		this.emit('change', this.active);
		this.$emit('update:modelValue', this.active);

		return true;
	}

	/**
	 * Toggles activation of the item(s) by the specified value(s).
	 * The methods return a new active component item(s).
	 *
	 * @param value
	 * @param [unsetPrevious] - true, if needed to reset previous active items (only works in the `multiple` mode)
	 */
	toggleActive(value: this['Active'], unsetPrevious: boolean = false): this['Active'] {
		const
			activeStore = this.field.get('activeStore');

		if (this.multiple) {
			if (!Object.isSet(activeStore)) {
				return this.active;
			}

			const toggle = (value) => {
				if (activeStore.has(value)) {
					if (unsetPrevious) {
						this.unsetActive(this.active);

					} else {
						this.unsetActive(value);
					}

					return;
				}

				this.setActive(value, unsetPrevious);
			};

			if (Object.isIterable(value)) {
				Object.forEach(value, toggle);

			} else {
				toggle(value);
			}

		} else if (activeStore !== value) {
			this.setActive(value);

		} else {
			this.unsetActive(value);
		}

		return this.active;
	}

	protected override initRemoteData(): CanUndef<CanPromise<this['Items'] | Dictionary>> {
		if (!this.db) {
			return;
		}

		const
			val = this.convertDBToComponent(this.db);

		if (Object.isDictionary(val)) {
			return Promise.all(this.state.set(val)).then(() => val);
		}

		if (Object.isArray(val)) {
			this.items = this.normalizeItems(<this['Items']>val);
		}

		return this.items;
	}

	protected override initBaseAPI(): void {
		super.initBaseAPI();

		const
			i = this.instance;

		this.isActive = i.isActive.bind(this);
		this.setActive = i.setActive.bind(this);
		this.normalizeItems = i.normalizeItems.bind(this);
	}

	/**
	 * Normalizes the specified items and returns it
	 * @param items
	 */
	protected normalizeItems(items: CanUndef<this['Items']>): this['Items'] {
		const
			normalizedItems = <this['Items']>[];

		if (items == null) {
			return normalizedItems;
		}

		for (let i = 0; i < items.length; i++) {
			const
				item = items[i];

			let
				{value, href} = item;

			if (value === undefined) {
				value = href;
			}

			const needAutoHref =
				href === undefined &&
				value !== undefined &&
				this.autoHref;

			if (needAutoHref) {
				href = String(value);

				if (!isAbsURL.test(href) && !href.startsWith('/') && !href.startsWith('#')) {
					href = `#${href}`;
				}
			}

			const
				classes = this.provide.hintClasses(item.hintPos).concat(item.classes ?? []),
				attrs = {...item.attrs};

			if (href === undefined) {
				attrs.role = 'tab';
			}

			normalizedItems.push({
				...item,

				attrs,
				classes,

				value,
				href
			});
		}

		return normalizedItems;
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
			activeStore = this.field.get('activeStore');

		for (let i = 0; i < this.items.length; i++) {
			const
				item = this.items[i],
				val = item.value;

			if (item.active && (this.multiple ? this.activeProp === undefined : activeStore === undefined)) {
				this.setActive(val);
			}

			values.set(val, i);
			indexes[i] = val;
		}

		this.values = values;
		this.indexes = indexes;
	}

	/**
	 * Returns a dictionary with props for the specified item
	 *
	 * @param item
	 * @param i - the position index
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

	protected override initModEvents(): void {
		super.initModEvents();
		iVisible.initModEvents(this);
	}

	/**
	 * Synchronization of the component items
	 *
	 * @param items
	 * @param oldItems
	 * @emits `itemsChange(value: this['Items'])`
	 */
	@watch(['value', 'itemsStore'])
	protected syncItemsWatcher(items: this['Items'], oldItems: this['Items']): void {
		if (!Object.fastCompare(items, oldItems)) {
			this.initComponentValues();
			this.emit('itemsChange', items);
		}
	}

	protected override onAddData(data: unknown): void {
		Object.assign(this.db, this.convertDataToDB(data));
	}

	protected override onUpdateData(data: unknown): void {
		Object.assign(this.db, this.convertDataToDB(data));
	}

	protected override onDeleteData(data: unknown): void {
		Object.assign(this.db, this.convertDataToDB(data));
	}

	/**
	 * Handler: there was a click on one of the items
	 *
	 * @param e
	 * @emits `actionChange(active: this['Active'])`
	 */
	@watch({
		path: '?$el:click',
		wrapper: (o, cb) => o.dom.delegateElement('link', cb)
	})

	protected onItemClick(e: Event): void {
		const
			target = <Element>e.delegateTarget,
			id = Number(target.getAttribute('data-id'));

		this.toggleActive(this.indexes[id]);
		this.emit('actionChange', this.active);
	}
}
