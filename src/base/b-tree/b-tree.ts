/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:base/b-tree/README.md]]
 * @packageDocumentation
 */

//#if demo
import 'models/demo/nested-list';
//#endif

import symbolGenerator from 'core/symbol';

import SyncPromise from 'core/promise/sync';
import { derive } from 'core/functools/trait';

import iItems from 'traits/i-items/i-items';
import iActiveItems, { IterationKey } from 'traits/i-active-items/i-active-items';

import iData, {

	component,

	prop,
	field,
	system,
	computed,

	hook,
	wait,
	watch,

	TaskParams,
	TaskI

} from 'super/i-data/i-data';

import type { Item, Items, RenderFilter } from 'base/b-tree/interface';

export * from 'super/i-data/i-data';
export * from 'base/b-tree/interface';

export const
	$$ = symbolGenerator();

interface bTree extends Trait<typeof iActiveItems> {}

@component({
	functional: {
		functional: true
	},

	model: {
		prop: 'activeProp',
		event: 'onChange'
	}
})

@derive(iActiveItems)
class bTree extends iData implements iActiveItems {
	/** @see [[iItems.Item]] */
	readonly Item!: Item;

	/** @see [[iItems.Items]] */
	readonly Items!: Items;

	/** @see [[iActiveItems.Active]] */
	readonly Active!: iActiveItems['Active'];

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
	 * A common filter to render items via `asyncRender`.
	 * It is used to optimize the process of rendering items.
	 *
	 * @see [[AsyncRender.iterate]]
	 * @see [[TaskFilter]]
	 */
	@prop({
		type: Function,
		required: false,
		default(ctx: bTree, item: unknown, i: number, task: TaskI): CanPromise<boolean> {
			if (ctx.level === 0 && task.i < ctx.renderChunks) {
				return true;
			}

			return ctx.async.animationFrame().then(() => true);
		}
	})

	readonly renderFilter!: RenderFilter;

	/**
	 * A filter to render nested items via `asyncRender`.
	 * It is used to optimize the process of rendering child items.
	 *
	 * @see [[AsyncRender.iterate]]
	 * @see [[TaskFilter]]
	 */
	@prop({type: Function, required: false})
	readonly nestedRenderFilter?: RenderFilter;

	/**
	 * Number of chunks to render via `asyncRender`
	 */
	@prop(Number)
	readonly renderChunks: number = 5;

	/**
	 * If true, then all nested elements are folded by default
	 */
	@prop(Boolean)
	readonly folded: boolean = true;

	/**
	 * Link to the top level component (internal parameter)
	 */
	@prop({type: Object, required: false})
	readonly top?: bTree;

	/**
	 * Component nesting level (internal parameter)
	 */
	@prop(Number)
	readonly level: number = 0;

	/** @see [[iActiveItems.activeProp]] */
	@prop({required: false})
	readonly activeProp?: iActiveItems['activeProp'];

	/** @see [[iActiveItems.multiple]] */
	@prop(Boolean)
	readonly multiple: boolean = false;

	/** @see [[iActiveItems.cancelable]] */
	@prop({type: Boolean, required: false})
	readonly cancelable?: boolean;

	/** @see [[iItems.items]] */
	@field<bTree>((o) => o.sync.link<Items>((val) => {
		if (o.dataProvider != null) {
			return <CanUndef<Items>>o.items ?? [];
		}

		return o.normalizeItems(val);
	}))

	items!: this['Items'];

	/**
	 * @see [[iActiveItems.activeStore]]
	 * @see [[iActiveItems.syncActiveStore]]
	 */
	@system<bTree>((o) => iActiveItems.linkActiveStore(o))
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
	valueIndexes!: Map<unknown, number>;

	/**
	 * A map of the item values and their descriptors
	 */
	@system()
	valueItems!: Map<unknown, this['Item']>;

	/** @inheritDoc */
	protected override readonly $refs!: {
		children?: bTree[];
	};

	/**
	 * Parameters for async render tasks
	 */
	protected get renderTaskParams(): TaskParams {
		return {
			filter: this.renderFilter.bind(this, this)
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

		if (this.$listeners.fold) {
			opts['@fold'] = this.$listeners.fold;
		}

		return opts;
	}

	/** @see [[iActiveItems.prototype.active] */
	@computed({cache: false})
	get active(): iActiveItems['active'] {
		return iActiveItems.getActive(this.top ?? this);
	}

	/** @see [[iActiveItems.prototype.activeElement] */
	get activeElement(): iActiveItems['activeElement'] {
		const
			ctx = this.top ?? this;

		return this.waitStatus('ready', () => {
			if (ctx.multiple) {
				if (!Object.isSet(this.active)) {
					return [];
				}

				return [...this.active].flatMap((val) => this.findItemElement(val) ?? []);
			}

			return this.findItemElement(this.active);
		});
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

	/**
	 * Folds the specified item.
	 * If the method is called without an element passed, all tree sibling elements will be folded.
	 *
	 * @param [value]
	 */
	@wait('ready')
	fold(value?: unknown): Promise<boolean> {
		if (arguments.length === 0) {
			const
				values: Array<Promise<boolean>> = [];

			for (const [item] of this.traverse(this, {deep: false})) {
				values.push(this.fold(item.value));
			}

			return SyncPromise.all(values)
				.then((res) => res.some((value) => value === true));
		}

		return this.toggleFold(value, true);
	}

	/**
	 * Unfolds the specified item.
	 * If method is called on nested item, all parent items will be unfolded.
	 * If the method is called without an element passed, all tree sibling elements will be unfolded.
	 *
	 * @param [value]
	 */
	@wait('ready')
	unfold(value?: unknown): Promise<boolean> {
		const
			values: Array<Promise<boolean>> = [];

		if (arguments.length === 0) {
			for (const [item] of this.traverse(this, {deep: false})) {
				if (!this.hasChildren(item)) {
					continue;
				}

				values.push(this.unfold(item.value));
			}

		} else {
			const
				ctx = this.top ?? this,
				item = this.valueItems.get(value);

			if (item != null && this.hasChildren(item)) {
				values.push(ctx.toggleFold(value, false));
			}

			let
				{parentValue} = item ?? {};

			while (parentValue != null) {
				const
					parent = this.valueItems.get(parentValue);

				if (parent != null) {
					values.push(ctx.toggleFold(parent.value, false));
					parentValue = parent.parentValue;

				} else {
					parentValue = null;
				}
			}
		}

		return SyncPromise.all(values)
			.then((res) => res.some((value) => value === true));
	}

	/**
	 * Toggles the passed item fold value
	 *
	 * @param value
	 * @param [folded] - if value is not passed the current state will be toggled
	 * @emits `fold(target: HTMLElement, item: `[[Item]]`, value: boolean)`
	 */
	@wait('ready')
	toggleFold(value: unknown, folded?: boolean): Promise<boolean> {
		const
			ctx = this.top ?? this;

		const
			oldVal = this.getFoldedMod(value) === 'true',
			newVal = folded ?? !oldVal;

		const
			el = ctx.findItemElement(value),
			item = this.valueItems.get(value);

		if (oldVal !== newVal && el != null && item != null && this.hasChildren(item)) {
			this.block?.setElMod(el, 'node', 'folded', newVal);
			ctx.emit('fold', el, item, newVal);
			return SyncPromise.resolve(true);
		}

		return SyncPromise.resolve(false);
	}

	isActive(value: unknown): boolean {
		return iActiveItems.isActive(this.top ?? this, value);
	}

	/** @see [[iActiveItems.prototype.setActive]] */
	setActive(value: this['Active'], unsetPrevious: boolean = false): boolean {
		const
			ctx = this.top ?? this;

		if (!iActiveItems.setActive(ctx, value, unsetPrevious)) {
			return false;
		}

		void ctx.unfold(value);

		const {
			$el,
			block: $b
		} = ctx;

		if ($el != null && $b != null) {
			if (!ctx.multiple || unsetPrevious) {
				const
					previousNodes = $el.querySelectorAll(`.${$b.getFullElName('node', 'active', true)}`);

				previousNodes.forEach((previousNode) => {
					if (!this.isActive(this.valueItems.get(previousNode.getAttribute('data-id')))) {
						setActive(previousNode, false);
					}
				});
			}

			SyncPromise.resolve(this.activeElement).then((activeElement) => {
				Array.concat([], activeElement).forEach((activeElement) => setActive(activeElement, true));
			}).catch(stderr);
		}

		return true;

		function setActive(el: Element, status: boolean) {
			$b!.setElMod(el, 'node', 'active', status);

			if (el.hasAttribute('aria-selected')) {
				el.setAttribute('aria-selected', String(status));
			}
		}
	}

	unsetActive(value: this['Active']): boolean {
		const
			ctx = this.top ?? this;

		if (!iActiveItems.unsetActive(ctx, value)) {
			return false;
		}

		const {
			$el,
			block: $b
		} = ctx;

		if ($el != null && $b != null) {
			const
				previousNodes = $el.querySelectorAll(`.${$b.getFullElName('node', 'active', true)}`);

			previousNodes.forEach((previousNode) => {
				if (!this.isActive(this.valueItems.get(previousNode.getAttribute('data-id')))) {
					$b.setElMod(previousNode, 'link', 'active', false);

					if (previousNode.hasAttribute('aria-selected')) {
						previousNode.setAttribute('aria-selected', 'false');
					}
				}
			});
		}

		return true;
	}

	/** @see [[iActiveItems.prototype.toggleActive]] */
	toggleActive(value: this['Active'], unsetPrevious?: boolean): this['Active'] {
		return iActiveItems.toggleActive(this.top ?? this, value, unsetPrevious);
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
			return this.items = this.normalizeItems(val);
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
	 * Returns a value of the `folded` modifier from an element by the specified identifier
	 * @param value
	 */
	protected getFoldedMod(value: unknown): CanUndef<string> {
		const
			target = this.findItemElement(value);

		if (target == null) {
			return;
		}

		return this.block?.getElMod(target, 'node', 'folded');
	}

	/**
	 * Searches an HTML element by the specified item value and returns it
	 * @param value
	 */
	protected findItemElement(value: unknown): HTMLElement | null {
		const
			ctx = this.top ?? this,
			id = this.valueIndexes.get(value);

		if (id == null) {
			return null;
		}

		return ctx.$el?.querySelector(`.${this.provide.fullElName('node', 'id', id)}`) ?? null;
	}

	/**
	 * Synchronization of items
	 *
	 * @param items
	 * @param oldItems
	 * @emits `itemsChange(value: this['Items'])`
	 */
	@watch({path: 'items', immediate: true})
	protected syncItemsWatcher(items: this['Items'], oldItems: this['Items']): void {
		if (!Object.fastCompare(items, oldItems)) {
			this.initComponentValues();

			this.async.setImmediate(() => {
				this.emit('itemsChange', items);
			}, {label: $$.syncItemsWatcher});
		}
	}

	/**
	 * Initializes component values
	 */
	@hook('beforeDataCreate')
	protected initComponentValues(): void {
		if (this.top == null) {
			this.indexes = {};
			this.valueIndexes = new Map();
			this.valueItems = new Map();

		} else {
			this.indexes = this.top.indexes;
			this.valueIndexes = this.top.valueIndexes;
			this.valueItems = this.top.valueItems;
		}

		this.field.get<this['Items']>('items')?.forEach((item) => {
			if (this.valueIndexes.has(item.value)) {
				return;
			}

			const
				{value} = item;

			const
				id = this.valueIndexes.size;

			this.indexes[id] = value;
			this.valueIndexes.set(value, id);
			this.valueItems.set(value, item);

			iActiveItems.initItem(this, item);
		});
	}

	/**
	 * Normalizes the specified items and returns it
	 * @param [items]
	 */
	protected normalizeItems(items: this['Items'] = []): this['Items'] {
		const that = this;

		items = Object.fastClone(items);
		items.forEach((el) => normalize(el));

		return items;

		function normalize(item: bTree['Item'], parentValue?: unknown) {
			if (!('parentValue' in item)) {
				item.parentValue = parentValue;

				if (Object.isArray(item.children)) {
					for (const el of item.children) {
						if (normalize(el, item.value)) {
							item.folded = false;
							break;
						}
					}
				}
			}

			return that.isActive(item.value) || item.folded === false;
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

		let
			target = <Element>e.target;

		if (target.matches(this.block!.getElSelector('fold'))) {
			return;
		}

		target = <Element>e.delegateTarget;

		const
			id = this.block?.getElMod(target, 'node', 'id');

		if (id != null) {
			this.toggleActive(this.indexes[id]);
		}

		(this.top ?? this).emit('actionChange', this.active);
	}
}

export default bTree;
