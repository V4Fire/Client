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
import { derive } from 'core/functools/trait';

import DOM, { delegateElement } from 'components/friends/dom';
import Block, { element, elements, setElementMod } from 'components/friends/block';

import iVisible from 'components/traits/i-visible/i-visible';
import iWidth from 'components/traits/i-width/i-width';

import iItems, { IterationKey } from 'components/traits/i-items/i-items';
import iActiveItems from 'components/traits/i-active-items/i-active-items';

import { component, field, system, computed, hook, watch, ModsDecl } from 'components/super/i-data/i-data';

import iListProps from 'components/base/b-list/props';
import Values from 'components/base/b-list/modules/values';

import { setActiveMod, normalizeItems } from 'components/base/b-list/modules/helpers';
import type { Items } from 'components/base/b-list/interface';

export * from 'components/super/i-data/i-data';
export * from 'components/base/b-list/interface';

DOM.addToPrototype({delegateElement});
Block.addToPrototype({element, elements, setElementMod});

interface bList extends Trait<typeof iActiveItems> {}

@component({
	functional: {
		wait: undefined,
		dataProvider: undefined,
		vModel: undefined
	}
})

@derive(iActiveItems)
class bList extends iListProps implements iVisible, iWidth, iActiveItems {
	protected override $refs!: iListProps['$refs'] & {items: HTMLElement[]};

	/** {@link bList.attrsProp} */
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
	 * {@link bList.itemsProp}
	 */
	@computed({dependencies: ['value', 'itemsStore']})
	get items(): this['Items'] {
		return <this['Items']>this.field.get('itemsStore');
	}

	/**
	 * Sets a new list of the component items
	 * {@link bList.items}
	 */
	set items(value: this['Items']) {
		this.field.set('itemsStore', value);

		if (this.isRelatedToSSR) {
			this.syncItemsWatcher(this.items);
		}
	}

	/** {@link iActiveItems.activeChangeEvent} */
	@system()
	readonly activeChangeEvent: string = 'change';

	/**
	 * {@link iActiveItems.active}
	 * {@link bList.activeStore}
	 */
	get active(): this['Active'] {
		return iActiveItems.getActive(this);
	}

	/**
	 * {@link iActiveItems.activeStore}
	 * {@link bList.activeProp}
	 */
	@system<bList>({
		unique: true,
		init: (o) => {
			o.watch('modelValue', (val) => o.setActive(val, true));
			return iActiveItems.linkActiveStore(o, (val) => o.modelValue ?? val);
		}
	})

	activeStore!: this['Active'];

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
	 * {@link bList.items}
	 */
	@field<bList>((o) => o.sync.link<Items>((val) => {
		if (o.dataProvider != null) {
			return <CanUndef<Items>>o.itemsStore ?? [];
		}

		return o.normalizeItems(val);
	}))

	protected itemsStore!: this['Items'];

	/**
	 * Internal API for working with component values
	 */
	@system({
		unique: true,
		init: (o) => new Values(o)
	})

	protected values!: Values;

	/** {@link iActiveItems.activeElement} */
	@computed({
		cache: true,
		dependencies: ['active']
	})

	get activeElement(): CanPromise<CanNull<CanArray<HTMLAnchorElement>>> {
		const
			{active} = this;

		const getEl = (value) => {
			const
				id = this.values.getIndex(value);

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

	/** {@link iActiveItems.prototype.getItemByValue} */
	getItemByValue(value: this['Item']['value']): CanUndef<this['Item']> {
		return this.values.getItem(value);
	}

	/**
	 * Activates the item(s) by the specified value(s).
	 * If the component is switched to the `multiple` mode, the method can take an iterable to set multiple items.
	 *
	 * @param value
	 * @param [unsetPrevious] - true, if needed to reset previous active items (only works in the `multiple` mode)
	 *
	 * @emits `change(active: CanArray<unknown>)`
	 */
	setActive(value: this['ActiveProp'], unsetPrevious: boolean = false): boolean {
		if (!iActiveItems.setActive(this, value)) {
			return false;
		}

		const
			{block: $b} = this;

		if ($b != null) {
			const
				id = this.values.getIndex(value),
				linkEl = id != null ? $b.element('link', {id}) : null;

			if (!this.multiple || unsetPrevious) {
				const previousLinkEls = $b.elements('link', {active: true});

				Object.forEach(previousLinkEls, (previousLinkEl) => {
					if (previousLinkEl !== linkEl) {
						setActiveMod.call(this, previousLinkEl, false);
					}
				});
			}

			SyncPromise.resolve(this.activeElement).then((selectedElement) => {
				Array.concat([], selectedElement).forEach((el) => setActiveMod.call(this, el, true));
			}, stderr);
		}

		this.$emit('update:modelValue', this.active);

		return true;
	}

	/**
	 * Deactivates the item(s) by the specified value(s).
	 * If the component is switched to the `multiple` mode, the method can take an iterable to unset multiple items.
	 *
	 * @param value
	 * @emits `change(active: unknown)`
	 */
	unsetActive(value: this['ActiveProp']): boolean {
		if (!iActiveItems.unsetActive(this, value)) {
			return false;
		}

		const {activeElement, block: $b} = this;

		if ($b != null) {
			SyncPromise.resolve(activeElement).then((activeElement) => {
				const els = Array.concat([], activeElement);

				els.forEach((el) => {
					const
						id = el.getAttribute('data-id') ?? -1,
						itemValue = this.values.getValue(id);

					if (itemValue == null) {
						return;
					}

					const needChangeMod = this.multiple && Object.isSet(value) ?
						value.has(itemValue) :
						value === itemValue;

					if (needChangeMod) {
						setActiveMod.call(this, el, false);
					}
				});
			}, stderr);
		}

		this.$emit('update:modelValue', this.active);

		return true;
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

	/** {@link normalizeItems} */
	protected normalizeItems(items: CanUndef<this['Items']>): this['Items'] {
		return normalizeItems.call(this, items);
	}

	/** {@link Values.initComponentValues} */
	@hook('beforeDataCreate')
	protected initComponentValues(itemsChanged: boolean = false): void {
		this.values.init(itemsChanged);
	}

	/** {@link iActiveItems.initActiveStoreListeners} */
	@hook('beforeDataCreate')
	protected initActiveStoreListeners(): void {
		iActiveItems.initActiveStoreListeners(this);
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

	/** {@link iActiveItems.getItemKey} */
	protected getItemKey(item: this['Item'], i: number): CanUndef<IterationKey> {
		return iItems.getItemKey(this, item, i);
	}

	/**
	 * Returns the `href` value for the specified item
	 * @param item
	 */
	protected getHref(item: this['Item']): CanUndef<string> {
		return item.href;
	}

	protected override initModEvents(): void {
		super.initModEvents();
		iVisible.initModEvents(this);
	}

	/**
	 * Synchronization of the component items
	 *
	 * @param items
	 * @param [oldItems]
	 * @emits `itemsChange(value: this['Items'])`
	 */
	@watch(['value', 'itemsStore'])
	protected syncItemsWatcher(items: this['Items'], oldItems?: this['Items']): void {
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
			id = target.getAttribute('data-id') ?? -1;

		this.toggleActive(this.values.getValue(id));
		this.emit(`action-${this.activeChangeEvent}`.camelize(false), this.active);
	}
}

export default bList;
