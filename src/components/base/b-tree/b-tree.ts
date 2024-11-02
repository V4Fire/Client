/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:components/base/b-tree/README.md]]
 * @packageDocumentation
 */

import symbolGenerator from 'core/symbol';

import SyncPromise from 'core/promise/sync';
import { derive } from 'components/traits';

import AsyncRender, { iterate, TaskOptions } from 'components/friends/async-render';
import Block, { getElementMod, setElementMod, getElementSelector, getFullElementName } from 'components/friends/block';
import DOM, { delegateElement } from 'components/friends/dom';

import iItems from 'components/traits/i-items/i-items';
import iActiveItems, { IterationKey } from 'components/traits/i-active-items/i-active-items';

import iData, { watch, hook, component, system, computed, field, UnsafeGetter } from 'components/super/i-data/i-data';
import type { Item, ItemMeta, UnsafeBTree } from 'components/base/b-tree/interface';

import iTreeProps from 'components/base/b-tree/props';

import iFoldable from 'components/base/b-tree/modules/foldable';
import Values from 'components/base/b-tree/modules/values';

import { setActiveMod, normalizeItems } from 'components/base/b-tree/modules/helpers';

export * from 'components/super/i-data/i-data';
export * from 'components/base/b-tree/interface';

AsyncRender.addToPrototype({iterate});
Block.addToPrototype({getElementMod, setElementMod, getElementSelector, getFullElementName});
DOM.addToPrototype({delegateElement});

const
	$$ = symbolGenerator();

interface bTree extends Trait<typeof iActiveItems>, Trait<typeof iFoldable> {}

@component({
	functional: {
		functional: true
	}
})

@derive(iActiveItems, iFoldable)
class bTree extends iTreeProps implements iActiveItems, iFoldable {
	override get unsafe(): UnsafeGetter<UnsafeBTree<this>> {
		return Object.cast(this);
	}

	/** {@link iItems.items} */
	get items(): this['Items'] {
		return this.field.get<this['Items']>('itemsStore') ?? [];
	}

	/** {@link iItems.items} */
	set items(value: this['Items']) {
		this.field.set('itemsStore', normalizeItems.call(this, value));

		if (this.isRelatedToSSR) {
			this.syncItemsWatcher(this.items);
		}
	}

	/**
	 * {@link iActiveItems.activeStore}
	 * {@link iActiveItems.linkActiveStore}
	 */
	@system<bTree>({
		unique: true,
		init: (o) => {
			o.watch('modelValue', (val: bTree['modelValue']) => o.setActive(val, true));
			return iActiveItems.linkActiveStore(o, (val) => o.modelValue ?? val);
		}
	})

	activeStore!: iActiveItems['activeStore'];

	/** {@link iFoldable.unfoldedStore} */
	@system<bTree>((o) => o.topProp?.unfoldedStore ?? new Set())
	unfoldedStore!: iFoldable['unfoldedStore'];

	/** {@link iActiveItems.activeChangeEvent} */
	@system()
	readonly activeChangeEvent: string = 'change';

	/** {@link [[iActiveItems.active]} */
	@computed({cache: false})
	get active(): this['Active'] {
		return iActiveItems.getActive(this.top);
	}

	/** {@link [[iActiveItems.activeElement]} */
	get activeElement(): iActiveItems['activeElement'] {
		const
			{top} = this;

		return this.waitComponentStatus('ready', () => {
			if (top.multiple) {
				if (!Object.isSet(this.active)) {
					return [];
				}

				return [...this.active].flatMap((val) => this.findItemElement(val) ?? []);
			}

			return this.findItemElement(this.active) ?? null;
		});
	}

	/**
	 * The context of the topmost bTree component
	 */
	protected get top(): bTree {
		return this.topProp ?? this;
	}

	/**
	 * Stores bTree normalized items.
	 * This store is needed because the `items` property should only be accessed through the get/set methods.
	 */
	@field<bTree>((o) => o.sync.link<Item[]>((val) => {
		if (o.dataProvider != null) {
			return <CanUndef<Item[]>>o.items ?? [];
		}

		return normalizeItems.call(o, val);
	}))

	protected itemsStore!: this['Items'];

	/** @inheritDoc */
	declare protected readonly $refs: iData['$refs'] & {
		children?: bTree[];
	};

	/**
	 * Internal API for working with component values
	 */
	@system<bTree>({
		unique: true,
		init: (o) => new Values(o)
	})

	protected values!: Values;

	/**
	 * Parameters for async render tasks
	 */
	protected get renderTaskParams(): TaskOptions {
		return {
			filter: this.renderFilter.bind(null, this)
		};
	}

	/**
	 * Props for recursively inserted bTree components
	 */
	protected get nestedTreeProps(): Dictionary {
		const
			{nestedRenderFilter} = this;

		const
			isRootLvl = this.level === 0,
			renderFilter = Object.isFunction(nestedRenderFilter) ? nestedRenderFilter : this.renderFilter;

		const opts = {
			level: this.level + 1,
			topProp: isRootLvl ? this : this.topProp,
			multiple: this.multiple,
			classes: this.classes,
			lazyRender: this.lazyRender,
			renderChunks: this.renderChunks,
			activeProp: this.active,
			nestedRenderFilter,
			renderFilter
		};

		const
			a = this.$attrs;

		if (a.onFold != null) {
			opts['@fold'] = a.onFold;
		}

		return opts;
	}

	/**
	 * Returns an iterator over the tree items based on the given arguments.
	 * The iterator returns pairs of elements `[Tree item, The bTree instance associated with the element]`.
	 *
	 * @param [ctx] - a context to start iteration, the top-level tree by default
	 * @param [opts] - additional options
	 */
	traverse(
		ctx: bTree = this.top,
		opts: {deep: boolean} = {deep: true}
	): IterableIterator<[this['Item'], bTree]> {
		const
			children = ctx.$refs.children ?? [],
			iter = createIter();

		return {
			[Symbol.iterator]() {
				return this;
			},

			next: iter.next.bind(iter)
		};

		function* createIter() {
			for (const item of ctx.items) {
				yield [item, ctx];
			}

			if (opts.deep) {
				for (const child of children) {
					yield* child.traverse(child);
				}
			}
		}
	}

	/** {@link iActiveItems.isActive} */
	isActive(value: this['Item']['value']): boolean {
		return iActiveItems.isActive(this.top, value);
	}

	/** {@link iActiveItems.prototype.getItemByValue} */
	getItemByValue(value: Item['value']): CanUndef<Item> {
		return this.values.getItem(value);
	}

	/** {@link iActiveItems.prototype.setActive} */
	setActive(value: this['ActiveProp'], unsetPrevious: boolean = false): boolean {
		const
			{top} = this;

		if (!iActiveItems.setActive(top, value, unsetPrevious)) {
			return false;
		}

		void top.unfold(value);

		// Deactivate previous active nodes
		if (!top.multiple || unsetPrevious) {
			for (const [node, {value}] of this.traverseActiveNodes()) {
				if (!this.isActive(value)) {
					setActiveMod.call(top, node, false);
				}
			}
		}

		// Activate current active nodes
		SyncPromise.resolve(this.activeElement).then((activeElement) => {
			Array.toArray(activeElement).forEach((activeElement) => setActiveMod.call(top, activeElement, true));
		}).catch(stderr);

		return true;
	}

	/** {@link iActiveItems.prototype.unsetActive} */
	unsetActive(value: this['ActiveProp']): boolean {
		const {top} = this;

		if (!iActiveItems.unsetActive(top, value)) {
			return false;
		}

		for (const [node, {value}] of this.traverseActiveNodes()) {
			if (!this.isActive(value)) {
				setActiveMod.call(top, node, false);
			}
		}

		return true;
	}

	/** {@link iActiveItems.prototype.toggleActive} */
	toggleActive(value: this['ActiveProp'], unsetPrevious?: boolean): this['Active'] {
		return iActiveItems.toggleActive(this.top, value, unsetPrevious);
	}

	/**
	 * Returns an iterator over the element nodes which have modifier `active = true`.
	 * The iterator returns pairs of elements `[Element, The id and value of an item associated with the element]`.
	 */
	protected traverseActiveNodes(): IterableIterator<[Element, ItemMeta]> {
		const
			{top, values} = this,
			{$el, block: $b} = top;

		if ($el != null && $b != null) {
			const iter = createIter();

			return {
				[Symbol.iterator]() {
					return this;
				},

				next: iter.next.bind(iter)
			};
		}

		return [].values();

		function* createIter() {
			const nodes = $el!.querySelectorAll(`.${$b!.getFullElementName('node', 'active', true)}`);

			for (let i = 0; i < nodes.length; i++) {
				const
					node = nodes[i],
					rawId = node.getAttribute('data-id');

				const
					id = rawId != null ? parseInt(rawId, 10) : undefined,
					value = id != null ? values.getValue(id) : undefined;

				yield [node, {id, value}];
			}
		}
	}

	/** {@link iItems.getItemKey} */
	protected getItemKey(item: this['Item'], i: number): CanUndef<IterationKey> {
		return iItems.getItemKey(this, item, i) ?? this.values.getItemKey(item.value);
	}

	protected override initRemoteData(): CanUndef<this['items']> {
		if (!this.db) {
			return;
		}

		const
			val = this.convertDBToComponent<this['items']>(this.db);

		if (Object.isArray(val)) {
			return this.items = val;
		}

		return this.items;
	}

	/**
	 * True, if the specified item has children
	 * @param item
	 */
	protected hasChildren(item: this['Item']): boolean {
		return Object.size(item.children?.length) > 0;
	}

	/**
	 * Returns a dictionary with props for the specified item
	 *
	 * @param item
	 * @param i - the position index
	 */
	protected getItemProps(item: this['Item'], i: number): Dictionary {
		const
			op = this.itemProps,
			props = Object.reject(item, ['value', 'parentValue', 'children', 'folded']);

		if (op == null) {
			return props;
		}

		return Object.isFunction(op) ?
			op(item, i, {
				key: this.getItemKey(item, i),
				ctx: this,
				...props
			}) :

			Object.assign(props, op);
	}

	/**
	 * Returns a dictionary with props for the specified item
	 * @param item
	 */
	protected getFoldProps(item: this['Item']): Dictionary {
		return {
			'@click': this.onFoldClick.bind(this, item)
		};
	}

	/**
	 * Returns the value of the `folded` property from the specified item
	 * @param item
	 */
	protected getFoldedPropValue(item: this['Item']): boolean {
		if (this.unfoldedStore.has(item.value)) {
			return false;
		}

		if (item.folded != null) {
			return item.folded;
		}

		return this.topProp?.folded ?? this.folded;
	}

	/**
	 * Searches an HTML element by the specified item value and returns it
	 * @param value
	 */
	protected findItemElement(value: this['Item']['value']): CanNull<HTMLElement> {
		const
			{top} = this,
			id = this.values.getIndex(value);

		if (id == null) {
			return null;
		}

		return top.$el?.querySelector(`[data-id="${id}"]`) ?? null;
	}

	/**
	 * Synchronization of tree items
	 *
	 * @param items
	 * @param [oldItems]
	 * @emits `itemsChange(value: this['Items'])`
	 */
	@watch({path: 'items', flush: 'sync'})
	protected syncItemsWatcher(items: this['Items'], oldItems?: this['Items']): void {
		if (!Object.fastCompare(items, oldItems)) {
			this.initComponentValues(oldItems != null);
			this.async.setImmediate(() => this.emit('itemsChange', items), {label: $$.syncItemsWatcher});
		}
	}

	/** {@link Values.initComponentValues} */
	@hook('beforeDataCreate')
	protected initComponentValues(itemsChanged: boolean = false): void {
		if (itemsChanged) {
			this.field.get<typeof this['unfoldedStore']>('unfoldedStore')!.clear();
		}

		this.values.init(itemsChanged);
	}

	/** {@link iActiveItems.initActiveStoreListeners} */
	@hook('beforeDataCreate')
	protected initActiveStoreListeners(): void {
		if (this.topProp == null) {
			iActiveItems.initActiveStoreListeners(this.top);
		}
	}

	/**
	 * Returns a filter function to check if an item needs to be rendered in a nested tree
	 * @param item
	 */
	protected getNestedTreeFilter(item: this['Item']): CanNull<() => CanPromise<boolean>> {
		const canRenderSynchronously = () =>
			!this.getFoldedPropValue(item) ||
			Object.isBoolean(this.lazyRender) ||
			this.lazyRender === 'items';

		if (SSR && canRenderSynchronously()) {
			return null;
		}

		return () => {
			if (canRenderSynchronously()) {
				return true;
			}

			const group = {
				group: 'nestedTree',
				label: String(this.values.getIndex(item.value)),
				join: true
			};

			const promise = () => new Promise<boolean>((resolve) => {
				const id = this.top.on('onUnfold', (_, el) => {
					if (item.value === el.value) {
						resolve(true);
						this.top.off(id);
					}
				}, group);
			});

			return this.top.async.promise(promise, group);
		};
	}

	/**
	 * Handler: the fold element has been clicked
	 * @param item
	 */
	protected onFoldClick(item: this['Item']): void {
		void this.toggleFold(item.value);
	}

	/**
	 * Handler: click on some item element
	 *
	 * @param e
	 * @emits `actionChange(active: this['Active'])`
	 */
	@watch<bTree>({
		path: '?$el:click',
		wrapper: (o, cb) => o.dom.delegateElement('node', Object.cast(cb))
	})

	protected onItemClick(e: Event): void {
		e.stopPropagation();

		const
			{top} = this;

		let
			target = <Element>e.target;

		if (target.matches(this.block!.getElementSelector('fold'))) {
			return;
		}

		target = <Element>e.delegateTarget;

		const id = target.getAttribute('data-id');

		if (id != null) {
			this.toggleActive(this.values.getValue(id));
		}

		top.emit(`action-${this.activeChangeEvent}`.camelize(false), this.active);
	}
}

export default bTree;
