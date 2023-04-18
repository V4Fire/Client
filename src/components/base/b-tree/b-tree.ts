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

import iData, { watch, hook, component, system, computed, field, wait, ModsDecl, UnsafeGetter } from 'components/super/i-data/i-data';
import type { Item, UnsafeBTree } from 'components/base/b-tree/interface';

import bTreeProps from 'components/base/b-tree/props';
import Foldable from 'components/base/b-tree/modules/foldable';
import { normalizeItems } from 'components/base/b-tree/modules/normalizers';
import * as dom from 'components/base/b-tree/modules/dom';

export * from 'components/super/i-data/i-data';
export * from 'components/base/b-tree/interface';

AsyncRender.addToPrototype({iterate});
Block.addToPrototype({getElementMod});

const
	$$ = symbolGenerator();

interface bTree extends Trait<typeof iActiveItems> {}

@component({
	functional: {
		functional: true
	}
})

@derive(iActiveItems)
class bTree extends bTreeProps implements iActiveItems {
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
	 * Stores b-tree normalized items.
	 * This store is needed because `items` property must be accessed only via get/set.
	 */
	@field<bTree>((o) => o.sync.link<Item[]>('itemsProp', (val) => {
		if (o.dataProvider != null) {
			return <CanUndef<Item[]>>o.items ?? [];
		}

		return normalizeItems.call(o, val);
	}))
	itemsStore: this['Items'] = [];

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
	valueIndexes!: Map<this['Item']['value'], string>;

	/**
	 * A map of the item values and their descriptors
	 */
	@system()
	valueItems!: Map<this['Item']['value'], this['Item']>;

	/** @see [[iActiveItems.prototype.active] */
	@computed({cache: false})
	get active(): this['Active'] {
		return iActiveItems.getActive(this.ctx);
	}

	/** @see [[iActiveItems.prototype.activeElement] */
	get activeElement(): iActiveItems['activeElement'] {
		const
			{ctx} = this;

		return this.waitComponentStatus('ready', () => {
			if (ctx.multiple) {
				if (!Object.isSet(this.active)) {
					return [];
				}

				return [...this.active].flatMap((val) => this.findItemElement(val) ?? []);
			}

			return this.findItemElement(this.active) ?? null;
		});
	}

	/**
	 * Component context - points to root b-tree
	 */
	get ctx(): bTree {
		return this.top ?? this;
	}

	static override readonly mods: ModsDecl = {
		clickableArea: [
			['fold'],
			'any'
		]
	};

	/**
	 * API for b-tree folding
	 */
	@system<bTree>((o) => new Foldable(o))
	protected foldable!: Foldable;

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
			top: isRootLvl ? this : this.top,
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

	/** @see [[DOM.getId]] */
	getDOMId(id: string): string;
	getDOMId(id: undefined | null): undefined;
	getDOMId(id: Nullable<string>): CanUndef<string> {
		return this.ctx.dom.getId(Object.cast(id));
	}

	/**
	 * Returns an iterator over the tree items based on the given arguments.
	 * The iterator returns pairs of elements `[Tree item, The bTree instance associated with the element]`.
	 *
	 * @param [ctx] - a context to start iteration, the top-level tree by default
	 * @param [opts] - additional options
	 */
	traverse(
		ctx: bTree = this.top ?? this,
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

	*traverseActiveNodes(): Generator<[Element, {id: CanUndef<string>; value: unknown}]> {
		const {ctx} = this;

		const {
			$el,
			block: $b
		} = ctx;

		if ($el != null && $b != null) {
			const nodes = $el.querySelectorAll(`.${$b.getFullElementName('node', 'active', true)}`);

			for (let i = 0; i < nodes.length; i++) {
				const
					node = nodes[i],
					id = ctx.dom.restoreId(node.getAttribute('data-id')),
					value = this.valueItems.get(id);

				yield [node, {id, value}];
			}
		}
	}

	/**
	 * @see [[Foldable.prototype.fold]]
	 */
	fold(value?: this['Item']['value']): Promise<boolean>;

	@wait('ready')
	fold(...args: unknown[]): Promise<boolean> {
		return this.foldable.fold(...args);
	}

	/**
	 * @see [[Foldable.prototype.unfold]]
	 */
	unfold(value?: this['Item']['value']): Promise<boolean>;

	@wait('ready')
	unfold(...args: unknown[]): Promise<boolean> {
		return this.foldable.unfold(...args);
	}

	/**
	 * @see [[Foldable.prototype.toggleFold]]
	 */
	@wait('ready')
	toggleFold(value: this['Item']['value'], folded?: boolean): Promise<boolean> {
		return this.foldable.toggleFold(value, folded);
	}

	/** @see [[iActiveItems.prototype.isActive]] */
	isActive(value: this['Item']['value']): boolean {
		return iActiveItems.isActive(this.ctx, value);
	}

	/** @see [[iActiveItems.prototype.setActive]] */
	setActive(value: this['ActiveInput'], unsetPrevious: boolean = false): boolean {
		const
			{ctx} = this;

		if (!iActiveItems.setActive(ctx, value, unsetPrevious)) {
			return false;
		}

		void ctx.unfold(value);

		// Deactivate previous active nodes
		if (!ctx.multiple || unsetPrevious) {
			for (const [node, {value}] of this.traverseActiveNodes()) {
				if (!this.isActive(value)) {
					dom.setActive(ctx.block, node, false);
				}
			}
		}

		// Activate current active nodes
		SyncPromise.resolve(this.activeElement).then((activeElement) => {
			Array.concat([], activeElement).forEach((activeElement) => dom.setActive(ctx.block, activeElement, true));
		}).catch(stderr);

		return true;
	}

	/** @see [[iActiveItems.prototype.unsetActive]] */
	unsetActive(value: this['ActiveInput']): boolean {
		const {ctx} = this;

		if (!iActiveItems.unsetActive(ctx, value)) {
			return false;
		}

		for (const [node, {value}] of this.traverseActiveNodes()) {
			if (!this.isActive(value)) {
				dom.setActive(ctx.block, node, false);
			}
		}

		return true;
	}

	/** @see [[iActiveItems.prototype.toggleActive]] */
	toggleActive(value: this['ActiveInput'], unsetPrevious?: boolean): this['Active'] {
		return iActiveItems.toggleActive(this.ctx, value, unsetPrevious);
	}

	/** @see [[iItems.getItemKey]] */
	protected getItemKey(item: this['Item'], i: number): CanUndef<IterationKey> {
		return iItems.getItemKey(this, item, i);
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

		return this.top?.folded ?? this.folded;
	}

	/**
	 * Searches an HTML element by the specified item value and returns it
	 * @param value
	 */
	protected findItemElement(value: this['Item']['value']): HTMLElement | null {
		const
			{ctx} = this,
			id = this.valueIndexes.get(value);

		if (id == null) {
			return null;
		}

		return ctx.$el?.querySelector(`[data-id=${ctx.dom.getId(`${id}`)}]`) ?? null;
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

		if (this.top == null) {
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
					get: () => this.top?.[property]
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
					id = `${that.$renderCounter}-${that.valueIndexes.size}`;

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
			{ctx} = this;

		let
			target = <Element>e.target;

		if (target.matches(this.block!.getElementSelector('fold'))) {
			return;
		}

		target = <Element>e.delegateTarget;

		const id = ctx.dom.restoreId(target.getAttribute('data-id'));

		if (id != null) {
			this.toggleActive(this.indexes[id]);
		}

		ctx.emit('actionChange', this.active);
	}
}

export default bTree;
