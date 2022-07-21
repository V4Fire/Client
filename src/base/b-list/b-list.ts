/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:base/b-list/README.md]]
 * @packageDocumentation
 */

//#if demo
import 'models/demo/list';
//#endif

import symbolGenerator from 'core/symbol';
import SyncPromise from 'core/promise/sync';

import { isAbsURL } from 'core/url';

import { derive } from 'core/functools/trait';
import iVisible from 'traits/i-visible/i-visible';
import iWidth from 'traits/i-width/i-width';
import iItems, { IterationKey } from 'traits/i-items/i-items';

import iData, { component, prop, field, system, computed, hook, watch, ModsDecl } from 'super/i-data/i-data';
import type { Active, Item, Items } from 'base/b-list/interface';
import iAccess from 'traits/i-access/i-access';

export * from 'super/i-data/i-data';
export * from 'base/b-list/interface';

export const
	$$ = symbolGenerator();

interface bList extends Trait<typeof iAccess> {}

/**
 * Component to create a list of tabs/links
 */
@component({
	functional: {
		dataProvider: undefined
	},

	model: {
		prop: 'activeProp',
		event: 'onChange'
	}
})

@derive(iAccess)
class bList extends iData implements iVisible, iWidth, iItems, iAccess {
	/**
	 * Type: component active item
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

	/**
	 * Type of the list' root tag
	 */
	@prop(String)
	readonly listTag: string = 'ul';

	/**
	 * Type of list' element tags
	 */
	@prop(String)
	readonly listElTag: string = 'li';

	/**
	 * An initial component active item/s.
	 * If the component is switched to the `multiple` mode, you can pass an array or Set to define several active items.
	 */
	@prop({required: false})
	readonly activeProp?: unknown[] | this['Active'];

	/**
	 * If true, then all items without the `href` option will automatically generate a link by using `value`
	 * and other props
	 */
	@prop(Boolean)
	readonly autoHref: boolean = false;

	/**
	 * If true, the component supports a feature of multiple active items
	 */
	@prop(Boolean)
	readonly multiple: boolean = false;

	/**
	 * If true, the component view orientation is vertical. Horizontal is default
	 */
	@prop(Boolean)
	readonly vertical: boolean = false;

	/**
	 * If true, the active item can be unset by using another click to it.
	 * By default, if the component is switched to the `multiple` mode, this value is set to `true`,
	 * otherwise to `false`.
	 */
	@prop({type: Boolean, required: false})
	readonly cancelable?: boolean;

	/**
	 * Initial additional attributes are provided to an "internal" (native) list tag
	 */
	@prop({type: Object, required: false})
	readonly attrsProp?: Dictionary;

	/**
	 * Additional attributes are provided to an "internal" (native) list tag
	 * @see [[bList.attrsProp]]
	 */
	get attrs(): Dictionary {
		return {...this.attrsProp};
	}

	/**
	 * List of component items
	 * @see [[bList.itemsProp]]
	 */
	@computed({dependencies: ['value', 'itemsStore']})
	get items(): this['Items'] {
		return <this['Items']>this.field.get('itemsStore');
	}

	/**
	 * Sets a new list of component items
	 * @see [[bList.items]]
	 */
	set items(value: this['Items']) {
		this.field.set('itemsStore', value);
	}

	/**
	 * A component active item/s.
	 * If the component is switched to the `multiple` mode, the getter will return a `Set` object.
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
	 * Store of component items
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
	 * Map of item indexes and their values
	 */
	@system()
	protected indexes!: Dictionary;

	/**
	 * Map of item values and their indexes
	 */
	@system()
	protected values!: Map<unknown, number>;

	/**
	 * An internal component active item store.
	 * If the component is switched to the `multiple` mode, the value is defined as a `Set` object.
	 *
	 * @see [[bList.activeProp]]
	 * @emits `immediateChange(active: CanArray<unknown>)`
	 */
	@system<bList>((o) => o.sync.link((val) => {
		const
			beforeDataCreate = o.hook === 'beforeDataCreate';

		if (val === undefined && beforeDataCreate) {
			if (o.multiple) {
				if (Object.isSet(o.activeStore)) {
					return o.activeStore;
				}

				return new Set(Array.concat([], o.activeStore));
			}

			return o.activeStore;
		}

		let
			newVal;

		if (o.multiple) {
			const
				objVal = new Set(Object.isSet(val) ? val : Array.concat([], val));

			if (Object.fastCompare(objVal, o.activeStore)) {
				return o.activeStore;
			}

			newVal = objVal;

		} else {
			newVal = val;
		}

		if (beforeDataCreate) {
			o.emit('immediateChange', o.multiple ? new Set(newVal) : newVal);

		} else {
			o.setActive(newVal);
		}

		return newVal;
	}))

	protected activeStore!: this['Active'];

	/**
	 * A link to the active item element.
	 * If the component is switched to the `multiple` mode, the getter will return an array of elements.
	 */
	@computed({
		cache: true,
		dependencies: ['active']
	})

	protected get activeElement(): CanPromise<CanUndef<CanArray<HTMLAnchorElement>>> {
		const
			{active} = this;

		const getEl = (value) => {
			const
				id = this.values.get(value);

			if (id != null) {
				return this.block?.element<HTMLAnchorElement>('link', {id});
			}
		};

		return this.waitStatus('ready', () => {
			if (this.multiple) {
				if (!Object.isSet(active)) {
					return [];
				}

				return [...active].flatMap((val) => getEl(val) ?? []);
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
	 * Activates an item by the specified value.
	 * If the component is switched to the `multiple` mode, the method can take a `Set` object to set multiple items.
	 *
	 * @param value
	 * @param [unsetPrevious] - true, if needed to unset previous active items (works only with the `multiple` mode)
	 *
	 * @emits `change(active: CanArray<unknown>)`
	 * @emits `immediateChange(active: CanArray<unknown>)`
	 */
	setActive(value: this['Active'], unsetPrevious: boolean = false): boolean {
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

			if (Object.isSet(value)) {
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
						$b.setElMod(previousLinkEl, 'link', 'active', false);
					}
				}
			}

			SyncPromise.resolve(this.activeElement).then((selectedElement) => {
				const
					els = Array.concat([], selectedElement);

				for (let i = 0; i < els.length; i++) {
					const el = els[i];
					$b.setElMod(el, 'link', 'active', true);
				}
			}, stderr);
		}

		this.emit('immediateChange', this.active);
		this.emit('change', this.active);

		return true;
	}

	/**
	 * Deactivates an item by the specified value.
	 * If the component is switched to the `multiple` mode, the method can take a `Set` object to unset multiple items.
	 *
	 * @param value
	 * @emits `change(active: unknown)`
	 * @emits `immediateChange(active: unknown)`
	 */
	unsetActive(value: unknown): boolean {
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

			if (Object.isSet(value)) {
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

				for (let i = 0; i < els.length; i++) {
					const
						el = els[i],
						id = el.getAttribute('data-id'),
						itemValue = this.indexes[String(id)];

					if (itemValue == null) {
						continue;
					}

					const needChangeMod = this.multiple && Object.isSet(value) ?
						value.has(itemValue) :
						value === itemValue;

					if (needChangeMod) {
						$b.setElMod(el, 'link', 'active', false);
					}
				}
			}, stderr);
		}

		this.emit('immediateChange', this.active);
		this.emit('change', this.active);

		return true;
	}

	/**
	 * Toggles activation of an item by the specified value.
	 * The methods return a new active component item/s.
	 *
	 * @param value
	 * @param [unsetPrevious] - true, if needed to unset previous active items (works only with the `multiple` mode)
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

			if (Object.isSet(value)) {
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

			item.classes = this.provide.hintClasses(item.hintPos)
				.concat(item.classes ?? []);

			normalizedItems.push({...item, value, href});
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

	protected override initModEvents(): void {
		super.initModEvents();
		iVisible.initModEvents(this);
	}

	/**
	 * Synchronization of items
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

	/**
	 * Returns true if the component is used as tab list
	 */
	protected get isTablist(): boolean {
		return this.items.some((el) => el.href === undefined);
	}

	protected override onAddData(data: unknown): void {
		Object.assign(this.db, this.convertDataToDB(data));
	}

	protected override onUpdData(data: unknown): void {
		Object.assign(this.db, this.convertDataToDB(data));
	}

	protected override onDelData(data: unknown): void {
		Object.assign(this.db, this.convertDataToDB(data));
	}

	/**
	 * Handler: click to some item element
	 *
	 * @param e
	 * @emits `actionChange(active: this['Active'])`
	 */
	@watch({
		field: '?$el:click',
		wrapper: (o, cb) => o.dom.delegateElement('link', cb)
	})

	protected onItemClick(e: Event): void {
		const
			target = <Element>e.delegateTarget,
			id = Number(target.getAttribute('data-id'));

		this.toggleActive(this.indexes[id]);
		this.emit('actionChange', this.active);
	}

	/**
	 * Handler: on active element changes
	 * @param cb
	 */
	protected onActiveChange(cb: Function): void {
		this.on('change', () => {
			if (Object.isSet(this.active)) {
				cb(this.block?.elements('link', {active: true}));

			} else {
				cb(this.block?.element('link', {active: true}));
			}
		});
	}
}

export default bList;
