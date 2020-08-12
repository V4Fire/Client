/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import symbolGenerator from 'core/symbol';
import { deprecated } from 'core/functools/deprecation';

import iVisible from 'traits/i-visible/i-visible';
import iWidth from 'traits/i-width/i-width';

import iData, { component, prop, field, system, computed, hook, watch, ModsDecl } from 'super/i-data/i-data';
import { Item, Items } from 'base/b-list/interface';

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
	},

	deprecatedProps: {
		valueProp: 'itemsProp'
	}
})

export default class bList extends iData implements iVisible, iWidth {
	/**
	 * Initial list of items
	 */
	@prop(Array)
	readonly itemsProp: Items = [];

	/**
	 * Initial component active value
	 */
	@prop({required: false})
	readonly activeProp?: CanArray<unknown>;

	/**
	 * If true, then all items without the "href" option will automatically generate a link by using "value"
	 * and other props
	 */
	@prop(Boolean)
	readonly autoHref: boolean = false;

	/**
	 * If true, then all item labels aren't shown
	 */
	@prop(Boolean)
	readonly hideLabels: boolean = false;

	/**
	 * If true, the component supports the feature of multiple active values
	 */
	@prop(Boolean)
	readonly multiple: boolean = false;

	/**
	 * If true, the active tab can be unset by using another click to it
	 * (works only with `multiple = false`)
	 */
	@prop(Boolean)
	readonly cancelable: boolean = false;

	/**
	 * List of items
	 * @see [[bList.itemsProp]]
	 */
	@field<bList>((o) => o.sync.link<Items>((val) => {
		if (o.dataProvider != null) {
			return <CanUndef<Items>>o.value ?? [];
		}

		return o.normalizeOptions(val);
	}))

	items!: Items;

	/**
	 * @override
	 * @see [[bList.items]]
	 */
	@deprecated({renamedTo: 'items'})
	get value(): Items {
		return this.items;
	}

	/**
	 * @override
	 * @see [[bList.items]]
	 */
	set value(items: Items) {
		this.items = items;
	}

	/**
	 * Component active value
	 * @see [[bList.activeStore]]
	 */
	get active(): unknown {
		const v = this.field.get('activeStore');
		return this.multiple ? Object.keys(<object>v) : v;
	}

	/** @inheritDoc */
	static readonly mods: ModsDecl = {
		...iVisible.mods,
		...iWidth.mods
	};

	/**
	 * Dictionary with temporary indexes
	 */
	@system()
	protected indexes!: Dictionary;

	/**
	 * Dictionary with temporary values
	 */
	@system()
	protected values!: Map<unknown, number>;

	/**
	 * Internal component active value store
	 *
	 * @see [[bList.activeProp]]
	 * @emits `change(active: unknown)`
	 * @emits `immediateChange(active: unknown)`
	 */
	@system<bList>((o) => o.sync.link((val) => {
		const
			beforeDataCreate = o.hook === 'beforeDataCreate';

		if (val === undefined && beforeDataCreate) {
			return o.activeStore;
		}

		let
			newVal;

		if (o.multiple) {
			const
				objVal = Object.fromArray(Array.concat([], val));

			if (Object.fastCompare(objVal, o.activeStore)) {
				return o.activeStore;
			}

			newVal = objVal;

		} else {
			newVal = val;
		}

		if (beforeDataCreate) {
			o.emit('immediateChange', newVal);

		} else {
			o.setActive(newVal);
		}

		return newVal;
	}))

	protected activeStore!: unknown;

	/**
	 * Returns a link to the active element
	 */
	@computed({
		cache: true,
		dependencies: ['active']
	})

	protected get activeElement(): CanPromise<CanUndef<HTMLAnchorElement>> {
		return this.waitStatus('ready', () => {
			const
				val = String(this.active);

			if (val in this.values) {
				return this.block?.element<HTMLAnchorElement>('link', {
					id: this.values[val]
				});
			}

			return undefined;
		});
	}

	/**
	 * Toggles activation of the specified value
	 *
	 * @param value
	 * @emits `change(active: unknown)`
	 */
	toggleActive(value: unknown): boolean {
		const
			active = this.field.get('activeStore');

		if (this.multiple) {
			if (String(value) in <Dictionary>active) {
				return this.removeActive(value);
			}

			return this.setActive(value);
		}

		if (active !== value) {
			return this.setActive(value);
		}

		return this.removeActive(value);
	}

	/**
	 * Activates the specified value
	 *
	 * @param value
	 * @emits `change(active: unknown)`
	 * @emits `immediateChange(active: unknown)`
	 */
	setActive(value: unknown): boolean {
		const
			active = this.field.get('activeStore'),
			stValue = Object.fastHash(value);

		if (this.multiple) {
			if (stValue in <Dictionary>active) {
				return false;
			}

			this.field.set(`activeStore.${stValue}`, true);

		} else if (active === value) {
			return false;

		} else {
			this.field.set('activeStore', value);
		}

		const
			{block: $b} = this;

		if ($b) {
			const
				target = $b.element('link', {id: this.values[stValue]});

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

		this.emit('change', this.active);
		this.emit('immediateChange', this.active);
		return true;
	}

	/**
	 * Deactivates the specified value
	 *
	 * @param value
	 * @emits change(active: unknown)
	 * @emits immediateChange(active: unknown)
	 */
	removeActive(value: unknown): boolean {
		const
			active = this.field.get<any>('activeStore'),
			cantCancel = !this.cancelable;

		if (this.multiple) {
			if (!Object.has(active, [value]) || cantCancel) {
				return false;
			}

			Object.set(active, [value], undefined);

		} else if (active !== value || cantCancel) {
			return false;

		} else {
			this.field.set('activeStore', undefined);
		}

		const
			{block: $b} = this;

		if ($b) {
			const
				target = $b.element('link', {id: this.values[String(value)]});

			if (target) {
				$b.setElMod(target, 'link', 'active', false);
			}
		}

		this.emit('change', this.active);
		this.emit('immediateChange', this.active);

		return true;
	}

	/** @override */
	protected initRemoteData(): CanUndef<Items> {
		if (!this.db) {
			return;
		}

		const
			val = this.convertDBToComponent<Items>(this.db);

		if (Object.isArray(val)) {
			return this.value = this.normalizeOptions(val);
		}

		return this.value;
	}

	/** @override */
	protected initBaseAPI(): void {
		super.initBaseAPI();

		const
			i = this.instance;

		this.isActive = i.isActive.bind(this);
		this.setActive = i.setActive.bind(this);
		this.normalizeOptions = i.normalizeOptions.bind(this);
	}

	/**
	 * Returns true if the specified item is active
	 * @param item
	 */
	protected isActive(item: Item): boolean {
		const active = this.field.get<any>('activeStore');
		return this.multiple ? Object.has(active, [item.value]) : item.value === active;
	}

	/**
	 * Normalizes the specified options and returns it
	 * @param options
	 */
	protected normalizeOptions(options: CanUndef<Items>): Items {
		const
			res = <Items>[];

		if (!options) {
			return res;
		}

		for (let i = 0; i < options.length; i++) {
			const
				el = options[i];

			if (el.value === undefined) {
				el.value = el.href;
			}

			if (el.href === undefined) {
				el.href = this.autoHref && el.value !== undefined ? `#${String(el.value)}` : 'javascript:void(0)';
			}

			res.push(el);
		}

		return res;
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
			items = this.field.get<CanUndef<Items>>('items') ?? [],
			active = this.field.get<any>('activeStore');

		for (let i = 0; i < items.length; i++) {
			const
				el = items[i],
				val = el.value;

			if (el.active && (this.multiple ? !Object.has(active, [val]) : active === undefined)) {
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
	 *
	 * @emits `valueChange(value: Items)`
	 * @emits `itemsChange(value: Items)`
	 */
	@watch('items')
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
			id = Number(this.block?.getElMod(target, 'link', 'id'));

		this.toggleActive(this.indexes[id]);
		this.emit('actionChange', this.active);
	}
}
