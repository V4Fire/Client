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
import { derive } from 'core/functools/trait';

import AsyncRender, { iterate, TaskOptions } from 'components/friends/async-render';
import Block, { getElementMod } from 'components/friends/block';

import iItems from 'components/traits/i-items/i-items';
import iActiveItems, { IterationKey } from 'components/traits/i-active-items/i-active-items';

import iData, { watch, hook, component, system, computed, field, ModsDecl, UnsafeGetter } from 'components/super/i-data/i-data';
import type { Item, UnsafeBTree } from 'components/base/b-tree/interface';

import bTreeProps from 'components/base/b-tree/props';
import Foldable from 'components/base/b-tree/modules/foldable';
import { setActiveMod, normalizeItems } from 'components/base/b-tree/modules/helpers';

export * from 'components/super/i-data/i-data';
export * from 'components/base/b-tree/interface';

AsyncRender.addToPrototype({iterate});
Block.addToPrototype({getElementMod});

const
	$$ = symbolGenerator();

interface bTree extends Trait<typeof iActiveItems>, Trait<typeof Foldable> {}

@component({
	functional: {
		functional: true
	}
})

@derive(iActiveItems)
@derive(Foldable)
class bTree extends bTreeProps implements iActiveItems, Foldable {
	override get unsafe(): UnsafeGetter<UnsafeBTree<this>> {
		return Object.cast(this);
	}

	/** @see [[iItems.items]] */
	get items(): this['Items'] {
		return this.field.get<this['Items']>('itemsStore') ?? [];
	}

	/** @see [[iItems.items]] */
	set items(value: this['Items']) {
		this.field.set('itemsStore', normalizeItems.call(this, value));
	}

	/**
	 * @see [[iActiveItems.activeStore]]
	 * @see [[iActiveItems.syncActiveStore]]
	 */
	@system<bTree>((o) => {
		o.watch('modelValue', (val) => o.setActive(val, true));

		return iActiveItems.linkActiveStore(o, (val) => o.modelValue ?? val);
	})

	activeStore!: iActiveItems['activeStore'];

	/**
	 * A map of the item indexes and their values
	 */
	@system()
	indexes!: Dictionary;

	/**
	 * A map of the item values and their indexes
	 */
	@system()
	valueIndexes!: Map<this['Item']['value'], number>;

	/**
	 * A map of the item values and their descriptors
	 */
	@system()
	valueItems!: Map<this['Item']['value'], this['Item']>;

	/**
	 * This prefix guarantees component :key uniqueness after item changes
	 */
	@system()
	itemKeyPrefix: number = 0;

	/** @see [[iActiveItems.activeChangeEvent]] */
	@system()
	readonly activeChangeEvent: string = 'change';

	/** @see [[iActiveItems.prototype.active] */
	@computed({cache: false})
	get active(): this['Active'] {
		return iActiveItems.getActive(this.top);
	}

	/** @see [[iActiveItems.prototype.activeElement] */
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

	static override readonly mods: ModsDecl = {
		clickableArea: [
			['fold'],
			'any'
		]
	};

	/**
	 * Returns root b-tree component
	 */
	protected get top(): bTree {
		return this.topProp ?? this;
	}

	/**
	 * Stores b-tree normalized items.
	 * This store is needed because `items` property must be accessed only via get/set.
	 */
	@field<bTree>((o) => o.sync.link<Item[]>((val) => {
		if (o.dataProvider != null) {
			return <CanUndef<Item[]>>o.items ?? [];
		}

		return normalizeItems.call(o, val);
	}))

	protected itemsStore: this['Items'] = [];

	/** @inheritDoc */
	protected override readonly $refs!: iData['$refs'] & {
		children?: bTree[];
	};

	/**
	 * Parameters for async render tasks
	 */
	protected get renderTaskParams(): TaskOptions {
		return {
			filter: this.renderFilter.bind(null, this)
		};
	}

	/**
	 * Props for recursively inserted tree components
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
		ctx: bTree = this.topProp ?? this,
		opts: { deep: boolean } = {deep: true}
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

	/** @see [[iActiveItems.prototype.isActive]] */
	isActive(value: this['Item']['value']): boolean {
		return iActiveItems.isActive(this.top, value);
	}

	/** @see [[iActiveItems.prototype.setActive]] */
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
					setActiveMod(top.block, node, false);
				}
			}
		}

		// Activate current active nodes
		SyncPromise.resolve(this.activeElement).then((activeElement) => {
			Array.concat([], activeElement).forEach((activeElement) => setActiveMod(top.block, activeElement, true));
		}).catch(stderr);

		return true;
	}

	/** @see [[iActiveItems.prototype.unsetActive]] */
	unsetActive(value: this['ActiveProp']): boolean {
		const {top} = this;

		if (!iActiveItems.unsetActive(top, value)) {
			return false;
		}

		for (const [node, {value}] of this.traverseActiveNodes()) {
			if (!this.isActive(value)) {
				setActiveMod(top.block, node, false);
			}
		}

		return true;
	}

	/** @see [[iActiveItems.prototype.toggleActive]] */
	toggleActive(value: this['ActiveProp'], unsetPrevious?: boolean): this['Active'] {
		return iActiveItems.toggleActive(this.top, value, unsetPrevious);
	}

	/**
	 * Returns an iterator over the element nodes which have modifier `active = true`.
	 * The iterator returns pairs of elements `[Element, The id and value of an item associated with the element]`.
	 */
	protected traverseActiveNodes(): IterableIterator<[Element, {id: CanUndef<number>; value: CanUndef<unknown>}]> {
		const
			{top, indexes} = this,
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
					value = id != null ? indexes[id] : undefined;

				yield [node, {id, value}];
			}
		}
	}

	/** @see [[iItems.getItemKey]] */
	protected getItemKey(item: this['Item'], i: number): CanUndef<IterationKey> {
		const key = iItems.getItemKey(this, item, i);

		return key ?? `${this.itemKeyPrefix}-${this.valueIndexes.get(item.value)}`;
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
	 * True, if specified item has children
	 * @param item
	 */
	protected hasChildren(item: this['Item']): boolean {
		return Object.size(item.children?.length) > 0;
	}

	/**
	 * Returns a dictionary with props for the specified item
	 *
	 * @param item
	 * @param i - position index
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
	 * Returns a value of the `folded` property from the specified item
	 * @param item
	 */
	protected getFoldedPropValue(item: this['Item']): boolean {
		if (item.folded != null) {
			return item.folded;
		}

		return this.topProp?.folded ?? this.folded;
	}

	/**
	 * Searches an HTML element by the specified item value and returns it
	 * @param value
	 */
	protected findItemElement(value: this['Item']['value']): HTMLElement | null {
		const
			{top} = this,
			id = this.valueIndexes.get(value);

		if (id == null) {
			return null;
		}

		return top.$el?.querySelector(`[data-id="${id}"]`) ?? null;
	}

	/**
	 * Synchronization of items
	 *
	 * @param items
	 * @param oldItems
	 * @emits `itemsChange(value: this['Items'])`
	 */
	@watch({path: 'items', immediate: true})
	protected syncItemsWatcher(items: this['Items'], oldItems?: this['Items']): void {
		if (!Object.fastCompare(items, oldItems)) {
			this.initComponentValues(oldItems != null);
			this.async.setImmediate(() => this.emit('itemsChange', items), {label: $$.syncItemsWatcher});
		}
	}

	/**
	 * Initializes component values
	 * @param [itemsChanged] - true, if the method is invoked after items changed
	 */
	@hook('beforeDataCreate')
	protected initComponentValues(itemsChanged: boolean = false): void {
		const
			that = this,
			{active} = this;

		let
			hasActive = false,
			activeItem;

		if (this.topProp == null) {
			this.itemKeyPrefix++;
			this.indexes = {};
			this.valueIndexes = new Map();
			this.valueItems = new Map();

			traverse(this.field.get<this['Items']>('itemsStore'));

			// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
			if (!hasActive) {
				if (itemsChanged && active != null) {
					this.field.set('activeStore', undefined);
				}

				if (activeItem != null) {
					iActiveItems.initItem(this, activeItem);
				}
			}

		} else {
			['indexes', 'valueIndexes', 'valueItems'].forEach((property) => {
				Object.defineProperty(this, property, {
					enumerable: true,
					configurable: true,
					get: () => this.topProp?.[property]
				});
			});
		}

		function traverse(items?: Array<bTree['Item']>) {
			items?.forEach((item) => {
				const
					{value} = item;

				if (that.valueIndexes.has(value)) {
					return;
				}

				const
					id = that.valueIndexes.size;

				that.indexes[id] = value;
				that.valueIndexes.set(value, id);
				that.valueItems.set(value, item);

				if (item.value === active) {
					hasActive = true;
				}

				if (item.active) {
					activeItem = item;
				}

				if (Object.isArray(item.children)) {
					traverse(item.children);
				}
			});
		}
	}

	/**
	 * Handler: fold element has been clicked
	 * @param item
	 */
	protected onFoldClick(item: this['Item']): void {
		void this.toggleFold(item.value);
	}

	/**
	 * Handler: click to some item element
	 *
	 * @param e
	 * @emits `actionChange(active: this['Active'])`
	 */
	@watch<bTree>({
		path: '?$el:click',
		wrapper: (o, cb) => o.dom.delegateElement('node', cb)
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
			this.toggleActive(this.indexes[id]);
		}

		top.emit(`action-${this.activeChangeEvent}`.camelize(false), this.active);
	}
}

export default bTree;
