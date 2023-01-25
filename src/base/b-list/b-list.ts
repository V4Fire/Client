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
import iActiveItems from 'traits/i-active-items/i-active-items';

import iData, { component, prop, field, system, computed, hook, watch, ModsDecl } from 'super/i-data/i-data';
import type { Active, Item, Items } from 'base/b-list/interface';

export * from 'super/i-data/i-data';
export * from 'base/b-list/interface';

export const
	$$ = symbolGenerator();

interface bList extends Trait<typeof iActiveItems> {}

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

@derive(iActiveItems)
class bList extends iData implements iVisible, iWidth, iActiveItems {
	/** @see [[iVisible.hideIfOffline]] */
	@prop(Boolean)
	readonly hideIfOffline: boolean = false;

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
	 * Map of item indexes and their values
	 */
	/** @see [[iActiveItems.prototype.indexes] */
	@system()
	indexes: Dictionary = {};

	/** @see [[iActiveItems.prototype.values] */
	@system()
	values: Map<unknown, number> = new Map();

	/**
	 * @see [[iActiveItems.activeProp]]
	 * @see [[iActiveItems.activeStore]]
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

	activeStore!: this['Active'];

	/**
	 * Additional attributes are provided to an "internal" (native) list tag
	 * @see [[bList.attrsProp]]
	 */
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

	/** @see [[iActiveItems.active] */
	get active(): this['Active'] {
		return iActiveItems.getActive(this);
	}

	/** @see [[iActiveItems.active] */
	set active(value: this['Active']) {
		this.field.set('activeStore', value);
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

	/** @see [[iActiveItems.prototype.activeElement] */
	@computed({
		cache: true,
		dependencies: ['active']
	})

	get activeElement(): iActiveItems['activeElement'] {
		return iActiveItems.getActiveElement(this, 'link');
	}

	/** @see [[iActiveItems.prototype.setActive] */
	setActive(value: this['Active'], unsetPrevious: boolean = false): boolean {
		const
			res = iActiveItems.addToActiveStore(this, value);

		if (!res) {
			return res;
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
					$b.setElMod(el, 'link', 'active', true);

					if (el.hasAttribute('aria-selected')) {
						el.setAttribute('aria-selected', 'true');
					}
				}
			}, stderr);
		}

		this.emit('immediateChange', this.active);
		this.emit('change', this.active);

		return true;
	}

	/** @see [[iActiveItems.prototype.unsetActive] */
	unsetActive(value: unknown): boolean {
		const
			{activeElement, block: $b} = this;

		const
			res = iActiveItems.removeFromActiveStorage(this, value);

		if (!res) {
			return res;
		}

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

						if (el.hasAttribute('aria-selected')) {
							el.setAttribute('aria-selected', 'false');
						}
					}
				}
			}, stderr);
		}

		this.emit('immediateChange', this.active);
		this.emit('change', this.active);

		return true;
	}

	/** @see [[iActiveItems.prototype.toggleActive]] */
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

	/** @see [[iActiveItems.prototype.syncItemsWatcher]] */
	@watch(['value', 'itemsStore'])
	syncItemsWatcher(items: this['Items'], oldItems: this['Items']): void {
		iActiveItems.syncItemsWatcher(this, items, oldItems);
	}

	/** @see [[iActiveItems.prototype.initComponentValues]] */
	@hook('beforeDataCreate')
	initComponentValues(): void {
		for (let i = 0; i < this.items.length; i++) {
			const
				item = this.items[i],
				val = item.value;

			this.values.set(val, i);
			this.indexes[i] = val;

			iActiveItems.initItemMods(this, item);
		}
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

			if (href === undefined) {
				item.attrs = {
					...item.attrs,
					role: 'tab'
				};
			}

			normalizedItems.push({...item, value, href});
		}

		return normalizedItems;
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
}

export default bList;
