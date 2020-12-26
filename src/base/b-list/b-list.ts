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

import { isAbsURL } from 'core/url';
import { deprecated, deprecate } from 'core/functools/deprecation';

import iVisible from 'traits/i-visible/i-visible';
import iWidth from 'traits/i-width/i-width';

import iData, { component, prop, field, system, computed, hook, watch, ModsDecl } from 'super/i-data/i-data';
import { Active, Item, Items } from 'base/b-list/interface';

export * from 'super/i-data/i-data';
export * from 'base/b-list/interface';

export const
	$$ = symbolGenerator();

/**
 * Component to create a list of tabs/links
 */
@component({
	functional: {
		dataProvider: undefined
	},

	model: {
		prop: 'valueProp',
		event: 'onChange'
	}
})

export default class bList extends iData implements iVisible, iWidth {
	/**
	 * Initial list of component items
	 */
	@prop(Array)
	readonly itemsProp: Items = [];

	/**
	 * @deprecated
	 * @see [[bList.itemsProp]]
	 */
	@prop({type: Array, required: false})
	readonly valueProp?: Items;

	/**
	 * Initial component active value/s.
	 * If the component is switched to the "multiple" mode, you can pass an array or Set to define several active values.
	 */
	@prop({required: false})
	readonly activeProp?: unknown[] | Active;

	/**
	 * If true, then all items without the "href" option will automatically generate a link by using "value"
	 * and other props
	 */
	@prop(Boolean)
	readonly autoHref: boolean = false;

	/**
	 * If true, the component supports the feature of multiple active values
	 */
	@prop(Boolean)
	readonly multiple: boolean = false;

	/**
	 * If true, the active item can be unset by using another click to it.
	 * By default, if the component is switched to the "multiple" mode, this value is set to `true`,
	 * otherwise to `false`.
	 */
	@prop({type: Boolean, required: false})
	readonly cancelable?: boolean;

	/**
	 * List of component items
	 * @see [[bList.itemsProp]]
	 */
	@computed({dependencies: ['value', 'itemsStore', 'deprecated']})
	get items(): Items {
		return <Items>this.field.get(this.deprecated ? 'value' : 'itemsStore');
	}

	/**
	 * Sets a new list of component items
	 * @see [[bList.itemsProp]]
	 */
	set items(value: Items) {
		this.field.set(this.deprecated ? 'value' : 'itemsStore', value);
	}

	/**
	 * @deprecated
	 * @see [[bList.items]]
	 */
	@field<bList>((o) => o.sync.link<CanUndef<Items>>((val) => {
		if (o.dataProvider != null) {
			return o.value;
		}

		return val != null ? o.normalizeItems(val) : val;
	}))

	value?: Items;

	/**
	 * Component active value.
	 * If the component is switched to the "multiple" mode, the getter will return a Set object.
	 *
	 * @see [[bList.activeStore]]
	 */
	get active(): Active {
		const
			v = this.field.get('activeStore');

		if (this.multiple) {
			return Object.isSet(v) ? new Set(v) : new Set();
		}

		return v;
	}

	/** @inheritDoc */
	static readonly mods: ModsDecl = {
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

	protected itemsStore!: Items;

	/**
	 * True, if the component works with the deprecated API
	 */
	@system()
	protected deprecated: boolean = false;

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
	 * Internal component active value store.
	 * If the component is switched to the "multiple" mode, the value is defined as a Set structure.
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

	protected activeStore!: Active;

	/**
	 * Returns a link to the active item element.
	 * If the component is switched to the "multiple" mode, the getter will return an array of elements.
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
				id = Object.get<CanUndef<number>>(this.values, [value]);

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
	 * Toggles activation of the specified value
	 * @param value - item value to activate
	 */
	toggleActive(value: unknown): boolean {
		const
			activeStore = this.field.get('activeStore');

		if (this.multiple) {
			if (Object.has(activeStore, [value])) {
				return this.unsetActive(value);
			}

			return this.setActive(value);
		}

		if (activeStore !== value) {
			return this.setActive(value);
		}

		return this.unsetActive(value);
	}

	/**
	 * Activates the specified value
	 *
	 * @param value
	 * @emits `change(active: CanArray<unknown>)`
	 * @emits `immediateChange(active: CanArray<unknown>)`
	 */
	setActive(value: unknown): boolean {
		const
			activeStore = this.field.get('activeStore');

		if (this.multiple) {
			if (Object.has(activeStore, [value])) {
				return false;
			}

			(<Set<unknown>>activeStore).add(value);

		} else if (activeStore === value) {
			return false;

		} else {
			this.field.set('activeStore', Object.freeze(value));
		}

		const
			{block: $b} = this;

		if ($b) {
			const
				id = Object.get<CanUndef<number>>(this.values, [value]),
				target = id != null ? $b.element('link', {id}) : null;

			if (!this.multiple) {
				const
					old = $b.element('link', {active: true});

				if (old && old !== target) {
					$b.setElMod(old, 'link', 'active', false);
				}
			}

			if (target) {
				$b.setElMod(target, 'link', 'active', true);
			}
		}

		this.emit('immediateChange', this.active);
		this.emit('change', this.active);

		return true;
	}

	/**
	 * Deactivates the specified value
	 *
	 * @param value
	 * @emits `change(active: unknown)`
	 * @emits `immediateChange(active: unknown)`
	 */
	unsetActive(value: unknown): boolean {
		const
			activeStore = this.field.get('activeStore');

		if (this.multiple) {
			if (!Object.has(activeStore, [value]) || this.cancelable === false) {
				return false;
			}

			(<Set<unknown>>activeStore).delete(value);

		} else if (activeStore !== value || this.cancelable !== true) {
			return false;

		} else {
			this.field.set('activeStore', undefined);
		}

		const
			{block: $b} = this;

		if ($b) {
			const
				id = Object.get<CanUndef<number>>(this.values, [value]),
				target = id != null ? $b.element('link', {id}) : null;

			if (target) {
				$b.setElMod(target, 'link', 'active', false);
			}
		}

		this.emit('immediateChange', this.active);
		this.emit('change', this.active);

		return true;
	}

	/**
	 * @deprecated
	 * @see [[bList.unsetActive]]
	 */
	@deprecated({renamedTo: 'unsetActive'})
	removeActive(value: unknown): boolean {
		return this.unsetActive(value);
	}

	/** @override */
	protected initRemoteData(): CanUndef<Items> {
		if (!this.db) {
			return;
		}

		const
			val = this.convertDBToComponent<Items>(this.db);

		if (Object.isArray(val)) {
			return this.items = this.normalizeItems(val);
		}

		return this.items;
	}

	/** @override */
	protected initBaseAPI(): void {
		super.initBaseAPI();

		const
			i = this.instance;

		this.isActive = i.isActive.bind(this);
		this.setActive = i.setActive.bind(this);

		if ('deprecated' in i.normalizeOptions) {
			this.normalizeItems = i.normalizeItems.bind(this);

		} else {
			deprecate({
				name: 'valueProp',
				type: 'property',
				renamedTo: 'itemsProp'
			});

			deprecate({
				name: 'value',
				type: 'property',
				renamedTo: 'items'
			});

			deprecate({
				name: 'normalizeOptions',
				type: 'method',
				renamedTo: 'normalizeItems'
			});

			this.deprecated = true;
			this.normalizeItems = i.normalizeOptions.bind(this);
		}
	}

	/**
	 * Returns true if the specified item is active
	 * @param item
	 */
	protected isActive(item: Item): boolean {
		const v = this.field.get('activeStore');
		return this.multiple ? Object.has(v, [item.value]) : item.value === v;
	}

	/**
	 * Normalizes the specified items and returns it
	 * @param items
	 */
	protected normalizeItems(items: CanUndef<Items>): Items {
		const
			res = <Items>[];

		if (!items) {
			return res;
		}

		for (let i = 0; i < items.length; i++) {
			const
				el = items[i];

			if (el.value === undefined) {
				el.value = el.href;
			}

			if (el.href === undefined) {
				let
					href = String(el.value);

				const valid = {
					'/': true,
					'#': true
				};

				if (!isAbsURL.test(href) && valid[href[0]] !== true) {
					href = `#${href}`;
				}

				el.href = this.autoHref && el.value !== undefined ? href : 'javascript:void(0)';
			}

			res.push(el);
		}

		return res;
	}

	/**
	 * @deprecated
	 * @see [[bList.normalizeItems]]
	 */
	@deprecated({renamedTo: 'normalizeItems'})
	protected normalizeOptions(items: CanUndef<Items>): Items {
		return this.normalizeItems(items);
	}

	/**
	 * Initializes component values
	 */
	@hook('beforeDataCreate')
	protected initComponentValues(): void {
		if (this.valueProp != null || this.field.get('value') != null) {
			this.deprecated = true;
		}

		const
			values = new Map(),
			indexes = {};

		const
			activeStore = this.field.get('activeStore');

		for (let i = 0; i < this.items.length; i++) {
			const
				el = this.items[i],
				val = el.value;

			if (el.active && (this.multiple ? this.activeProp === undefined : activeStore === undefined)) {
				this.setActive(val);
			}

			Object.set(values, [val], i);
			indexes[i] = val;
		}

		this.values = values;
		this.indexes = indexes;
	}

	/** @override */
	protected initModEvents(): void {
		super.initModEvents();
		iVisible.initModEvents(this);
	}

	/**
	 * Synchronization of items
	 *
	 * @param value
	 * @param oldValue
	 * @emits `itemsChange(value: Items)`
	 */
	@watch(['value', 'itemsStore'])
	protected syncItemsWatcher(value: Items, oldValue: Items): void {
		if (!Object.fastCompare(value, oldValue)) {
			this.initComponentValues();

			/** @deprecated */
			this.emit('valueChange', value);
			this.emit('itemsChange', value);
		}
	}

	/** @override */
	protected onAddData(data: unknown): void {
		Object.assign(this.db, this.convertDataToDB(data));
	}

	/** @override */
	protected onUpdData(data: unknown): void {
		Object.assign(this.db, this.convertDataToDB(data));
	}

	/** @override */
	protected onDelData(data: unknown): void {
		Object.assign(this.db, this.convertDataToDB(data));
	}

	/**
	 * Handler: click to some item element
	 *
	 * @param e
	 * @emits `actionChange(active: unknown)`
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
}
