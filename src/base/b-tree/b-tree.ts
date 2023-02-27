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
import iActiveItems from 'traits/i-active-items/i-active-items';
import type { IterationKey } from 'traits/i-active-items/i-active-items';

import iData, {

	component,
	prop,
	field,
	TaskParams,
	TaskI,
	wait,
	system,
	watch,
	computed,
	hook

} from 'super/i-data/i-data';

import type { Item, Items, RenderFilter } from 'base/b-tree/interface';

export * from 'super/i-data/i-data';
export * from 'base/b-tree/interface';

export const
	$$ = symbolGenerator();

interface bTree extends Trait<typeof iActiveItems> {}

/**
 * Component to render tree of any elements
 */
@component({
	model: {
		prop: 'activeProp',
		event: 'onChange'
	}
})

@derive(iActiveItems)
class bTree extends iData implements iActiveItems {
	/** @see [[iActiveItems.Active]] */
	readonly Active!: iActiveItems['Active'];

	/** @see [[iItems.Item]] */
	readonly Item!: Item;

	/** @see [[iItems.Items]] */
	readonly Items!: Items;

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
	@field<bTree>((ctx) => ctx.sync.link<Items>((val) => ctx.normalizeItems(val)))
	items!: this['Items'];

	/**
	 * @see [[iActiveItems.activeStore]]
	 * @see [[iActiveItems.syncActiveStore]]
	 */
	@system<bTree>((o) => o.sync.link((val) => iActiveItems.syncActiveStore(o, val)))
	activeStore!: iActiveItems['activeStore'];

	/** @see [[iActiveItems.prototype.indexes]] */
	@system()
	indexes!: Dictionary;

	/** @see [[iActiveItems.prototype.values]] */
	@system()
	values!: Map<unknown, number>;

	/**
	 * Map with values and items
	 * @see [[iActiveItems.prototype.values]]
	 */
	@system()
	valuesToItems!: Map<unknown, Item>;

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

	/** @see [[iActiveItems.prototype.activeElement] */
	@computed({
		cache: true,
		dependencies: ['active']
	})

	get activeElement(): iActiveItems['activeElement'] {
		return iActiveItems.getActiveElement(this, 'node');
	}

	/** @see [[iActiveItems.prototype.active] */
	get active(): iActiveItems['active'] {
		return iActiveItems.getActive(this);
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
	fold(value?: this['Item']['value']): Promise<boolean> {
		if (value == null) {
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
	unfold(value?: this['Item']['value']): Promise<boolean> {
		const
			values: Array<Promise<boolean>> = [];

		if (value == null) {
			for (const [item] of this.traverse(this, {deep: false})) {
				if (!this.hasChildren(item)) {
					continue;
				}

				values.push(this.unfold(item.value));
			}

			return SyncPromise.all(values)
				.then((res) => res.some((value) => value === true));
		}

		const
			item = this.valuesToItems.get(value);

		if (item != null && this.hasChildren(item)) {
			values.push(this.toggleFold(value, false));
		}

		let
			{parentValue} = item ?? {};

		while (parentValue != null) {
			const
				parent = this.valuesToItems.get(parentValue);

			if (parent != null) {
				values.push(this.toggleFold(parent.value, false));
				parentValue = parent.parentValue;
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
	toggleFold(value: this['Item']['value'], folded?: boolean): Promise<boolean> {
		const
			ctx = this.top ?? this,
			element = ctx.findItemElement(value),
			oldVal = this.getFoldedMod(value) === 'true',
			newVal = folded ?? !oldVal,
			item = this.valuesToItems.get(value);

		if (oldVal !== newVal && element != null && item != null && this.hasChildren(item)) {
			this.block?.setElMod(element, 'node', 'folded', newVal);
			ctx.emit('fold', element, item, newVal);

			return SyncPromise.resolve(true);
		}

		return SyncPromise.resolve(false);
	}

	/**
	 * Synchronization of items
	 *
	 * @param items
	 * @param oldItems
	 * @emits `itemsChange(value: this['Items'])`
	 */
	@watch({field: 'items'})
	syncItemsWatcher(items: this['Items'], oldItems: this['Items']): void {
		if (!Object.fastCompare(items, oldItems)) {
			this.emit('itemsChange', items);
		}
	}

	/** @see [[iActiveItems.prototype.initComponentValues]] */
	@hook('created')
	@hook('beforeUpdate')
	initComponentValues(): void {
		if (this.top == null) {
			this.values = new Map();
			this.indexes = {};
			this.valuesToItems = new Map();

		} else {
			this.values = this.top.values;
			this.indexes = this.top.indexes;
			this.valuesToItems = this.top.valuesToItems;
		}

		this.items.forEach((item) => {
			if (this.values.has(item.value)) {
				return;
			}

			const
				{value} = item,
				{size} = this.values;

			this.values.set(value, size);
			this.indexes[size] = value;
			this.valuesToItems.set(value, item);

			iActiveItems.initItemActive(this, item);
		});
	}

	/** @see [[iActiveItems.prototype.setActive]] */
	setActive(value: this['Active'], unsetPrevious: boolean = false): boolean {
		const
			ctx = this.top ?? this,
			{active, multiple} = ctx;

		const
			res = iActiveItems.setActive(ctx, value);

		if (!res) {
			return res;
		}

		for (const [item, component] of ctx.traverse()) {
			const
				{block: $b} = component,
				id = this.values.get(item.value),
				itemEl = $b?.element('node', {id});

			const needSetActiveTrue = multiple && Object.isSet(value) ?
				value.has(item.value) :
				value === item.value;

			const needSetActiveFalse = multiple && Object.isSet(active) ?
				active.has(item.value) :
				active === item.value;

			if (needSetActiveTrue) {
				$b?.setElMod(itemEl, 'node', 'active', true);

				if (itemEl?.hasAttribute('aria-selected')) {
					itemEl.setAttribute('aria-selected', 'true');
				}

			} else if (needSetActiveFalse || multiple && unsetPrevious) {
				$b?.setElMod(itemEl, 'node', 'active', false);
			}
		}

		void ctx.unfold(value);

		return true;
	}

	unsetActive(value: this['Active']): boolean {
		const
			ctx = this.top ?? this,
			{multiple} = ctx;

		const
			res = iActiveItems.unsetActive(ctx, value);

		if (!res) {
			return res;
		}

		for (const [item, component] of ctx.traverse()) {
			const
				{block: $b} = component,
				id = this.values.get(item.value),
				itemEl = $b?.element('node', {id});

			const needChangeMod = multiple && Object.isSet(value) ?
				value.has(item.value) :
				value === item.value;

			if (needChangeMod) {
				$b?.setElMod(itemEl, 'node', 'active', false);

				if (itemEl?.hasAttribute('aria-selected')) {
					itemEl.setAttribute('aria-selected', 'false');
				}

				break;
			}
		}

		return true;
	}

	/** @see [[iActiveItems.prototype.toggleActive]] */
	toggleActive(value: iActiveItems['Active'], unsetPrevious: boolean = false): this['Active'] {
		const
			ctx = this.top ?? this,
			{multiple, active} = ctx;

		if (multiple) {
			if (!Object.isSet(active)) {
				return active;
			}

			let count = 0;

			for (const [item, component] of ctx.traverse()) {
				if (Object.isSet(value)) {
					if (unsetPrevious && active.has(item.value)) {
						toggleActive(component, item.value);
						continue;
					}

					if (value.has(item.value)) {
						toggleActive(component, item.value);

						if (++count === value.size) {
							break;
						}
					}

				} else if (item.value === value) {
					toggleActive(component, item.value);
					break;
				}
			}

		} else if (active !== value) {
			ctx.setActive(value, unsetPrevious);

		} else {
			ctx.unsetActive(value);
		}

		return ctx.active;

		function toggleActive(component: bTree, value: Item['value']) {
			const
				{block: $b} = component,
				id = ctx.values.get(value),
				itemEl = $b?.element('node', {id});

			if (!Object.isSet(ctx.active)) {
				return;
			}

			const
				needToAdd = !ctx.active.has(value);

			const res = needToAdd ?
				iActiveItems.setActive(ctx, value) :
				iActiveItems.unsetActive(ctx, value);

			if (!res) {
				return;
			}

			$b?.setElMod(itemEl, 'node', 'active', needToAdd);

			if (needToAdd) {
				itemEl?.setAttribute('aria-selected', String(needToAdd));
				void ctx.unfold(value);

			} else {
				itemEl?.removeAttribute('aria-selected');
			}

			ctx.emit('immediateChange', ctx.active);
			ctx.emit('change', ctx.active);
		}
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
	protected getFoldedMod(value: this['Item']['value']): CanUndef<string> {
		const
			target = this.findItemElement(value);

		if (!target) {
			return;
		}

		return this.block?.getElMod(target, 'node', 'folded');
	}

	/**
	 * Searches an HTML element by the specified identifier and returns it
	 * @param value
	 */
	protected findItemElement(value: this['Item']['value']): CanUndef<HTMLElement> {
		const itemId = this.values.get(value);
		return this.$el?.querySelector(`[data-id="${itemId}"]`) ?? undefined;
	}

	/**
	 * Normalizes the specified items and returns it
	 *
	 * @param [items]
	 * @param [parentValue] - value of the parent item of nested item
	 */
	protected normalizeItems(items: this['Items'] = [], parentValue?: this['Item']['value']): this['Items'] {
		return items.map((item) => {
			const
				normalizedItem = Object.fastClone(item);

			normalizedItem.parentValue ??= parentValue;

			if (normalizedItem.children != null) {
				normalizedItem.children = this.normalizeItems(normalizedItem.children, normalizedItem.value);
			}

			const isItemActive = Object.isSet(this.active) && this.active.has(normalizedItem.value) ||
				normalizedItem.value === this.active;

			if (isItemActive) {
				this.localEmitter.once('asyncRenderChunkComplete', () => {
					void (this.top ?? this).unfold(normalizedItem.value);
				});
			}

			return normalizedItem;
		});
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
		field: '?$el:click',
		wrapper: (o, cb) => o.dom.delegateElement('node', cb)
	})

	protected onItemClick(e: Event): void {
		e.stopPropagation();

		let
			target = <Element>e.target;

		if (target.matches(this.block?.getElSelector('fold') ?? '')) {
			return;
		}

		target = <Element>e.delegateTarget;

		const
			ctx = this.top ?? this,
			id = Number(this.block?.getElMod(target, 'node', 'id'));

		this.toggleActive(this.indexes[id]);
		ctx.emit('actionChange', ctx.active);
	}
}

export default bTree;
