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

interface bTree extends Trait<typeof iActiveItems> {
}

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
	@field<bTree>((o) => o.sync.link<Items>((val) => {
		if (o.dataProvider != null) {
			return <CanUndef<Items>>o.items ?? [];
		}

		return o.normalizeItems(val);
	}))

	items!: this['Items'];

	/**
	 * @see [[iActiveItems.activeProp]]
	 * @see [[iActiveItems.initActiveStore]]
	 */
	@system<bTree>((ctx) => ctx.sync.link((value) => {
		if (ctx.top != null) {
			return ctx.top.activeStore;
		}

		const
			{multiple, activeStore} = ctx,
			beforeDataCreate = ctx.hook === 'beforeDataCreate';

		let
			newVal;

		if (value === undefined && beforeDataCreate) {
			if (ctx.multiple) {
				if (Object.isSet(ctx.activeStore)) {
					return ctx.activeStore;
				}

				return new Set(Array.concat([], ctx.activeStore));
			}

			return ctx.activeStore;
		}

		if (multiple) {
			newVal = new Set(Object.isSet(value) ? value : Array.concat([], value));

			if (Object.fastCompare(newVal, activeStore)) {
				return activeStore;
			}

		} else {
			newVal = value;
		}

		if (beforeDataCreate) {
			void ctx.waitStatus('ready').then(() => {
				void Promise.resolve().then(() => ctx.setActive(newVal));
			});

		} else {
			ctx.setActive(newVal);
		}

		if (multiple) {
			return new Set();
		}
	}))

	activeStore!: iActiveItems['activeStore'];

	/** @see [[iActiveItems.prototype.indexes]] */
	@system()
	indexes: unknown[] = [];

	/** @see [[iActiveItems.prototype.values]] */
	@system()
	values: Map<unknown, number> = new Map();

	/**
	 * Map with values and items
	 */
	@system()
	valuesToItems: Map<unknown, Item> = new Map();

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
			classes: this.classes,
			renderChunks: this.renderChunks,
			nestedRenderFilter,
			renderFilter
		};

		if (this.$listeners.fold) {
			opts['@fold'] = this.$listeners.fold;
		}

		return opts;
	}

	/** @see [[iActiveItems.activeElement]] */
	@computed({
		cache: true,
		dependencies: ['active']
	})

	get activeElement(): iActiveItems['activeElement'] {
		return iActiveItems.getActiveElement(this.top ?? this, 'node');
	}

	/** @see [[iActiveItems.active] */
	get active(): iActiveItems['active'] {
		return iActiveItems.getActive(this.top ?? this);
	}

	/**
	 *  Sets an active to the active store
	 *  @param value
	 */
	set active(value: this['Active']) {
		(this.top ?? this).activeStore = value;
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

		const
			isFolded = this.getFoldedMod(value) === 'true';

		if (isFolded) {
			return SyncPromise.resolve(false);
		}

		return this.toggleFold(value);
	}

	/**
	 * Unfolds the specified item.
	 * If the method is called without an element passed, all tree sibling elements will be unfolded.
	 *
	 * @param [value]
	 */
	@wait('ready')
	unfold(value?: this['Item']['value']): Promise<boolean> {
		if (value == null) {
			const
				values: Array<Promise<boolean>> = [];

			for (const [item] of this.traverse(this, {deep: false})) {
				values.push(this.unfold(item.value));
			}

			return SyncPromise.all(values)
				.then((res) => res.some((value) => value === true));
		}

		const
			isUnfolded = this.getFoldedMod(value) === 'false';

		if (isUnfolded) {
			return SyncPromise.resolve(false);
		}

		return this.toggleFold(value);
	}

	/**
	 * Toggles the passed item fold value
	 *
	 * @param value
	 * @emits `fold(target: HTMLElement, item: `[[Item]]`, value: boolean)`
	 */
	@wait('ready')
	toggleFold(value: this['Item']['value']): Promise<boolean> {
		const
			target = this.findItemNodeElement(value),
			newVal = this.getFoldedMod(value) === 'false',
			item = this.valuesToItems.get(value);

		if (target != null && item != null && this.hasChildren(item)) {
			this.block?.setElMod(target, 'node', 'folded', newVal);
			this.emit('fold', target, item, newVal);

			return SyncPromise.resolve(true);
		}

		return SyncPromise.resolve(false);
	}

	/**
	 *  @see [[iActiveItems.prototype.syncItemsWatcher]]
	 *  @see [[iActiveItems.initItemsMods]]
	 */
	@watch({field: 'items', immediate: true})
	@wait('ready')
	syncItemsWatcher(items: this['Items'], oldItems: this['Items']): void {
		if (!Object.fastCompare(items, oldItems)) {
			iActiveItems.initItemsMods(this);
			this.emit('itemsChange', items);
		}
	}

	/** @see [[iActiveItems.setActive]] */
	setActive(value: this['Active'], unsetPrevious: boolean = false): boolean {
		const
			ctx = this.top ?? this,
			{active, multiple} = ctx,
			modName = 'active';

		let
			isActiveSet = false;

		for (const [item, component] of ctx.traverse()) {
			if (!isActiveSet) {
				isActiveSet = true;

				const
					res = iActiveItems.addToActiveStore(ctx, value);

				if (!res) {
					return res;
				}
			}

			const
				{block: $b} = component.unsafe,
				id = this.values.get(item.value),
				itemEl = $b?.element('node', {id});

			const needSetActiveTrue = multiple && Object.isSet(value) ?
				value.has(item.value) :
				value === item.value;

			const needSetActiveFalse = multiple && Object.isSet(active) ?
				active.has(item.value) :
				active === item.value;

			if (needSetActiveTrue) {
				$b?.setElMod(itemEl, 'node', modName, true);

				ctx.unfoldAllParents(item);

				if (itemEl?.hasAttribute('aria-selected')) {
					itemEl.setAttribute('aria-selected', 'true');
				}

				break;

			} else if (needSetActiveFalse || multiple && unsetPrevious) {
				$b?.setElMod(itemEl, 'node', modName, false);
				break;
			}
		}

		ctx.emit('immediateChange', ctx.active);
		ctx.emit('change', ctx.active);

		return true;
	}

	/** @see [[iActiveItems.unsetActive]] */
	unsetActive(value: this['Active']): boolean {
		const
			ctx = this.top ?? this,
			{multiple} = ctx;

		let
			isValueRemoved = false;

		for (const [item, component] of ctx.traverse()) {
			if (!isValueRemoved) {
				isValueRemoved = true;

				const
					res = iActiveItems.removeFromActiveStorage(ctx, value);

				if (!res) {
					return res;
				}
			}

			const
				{block: $b} = component.unsafe,
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

		ctx.emit('immediateChange', ctx.active);
		ctx.emit('change', ctx.active);

		return true;
	}

	toggleActive(value: iActiveItems['Active'], unsetPrevious: boolean = false): this['Active'] {
		const
			ctx = this.top ?? this,
			{multiple, active} = ctx;

		if (multiple) {
			if (!Object.isSet(active)) {
				return active;
			}

			let amount = 0;

			for (const [item, component] of ctx.traverse()) {
				if (Object.isSet(value)) {
					if (unsetPrevious && active.has(item.value)) {
						toggleActive(component, item);
						continue;
					}

					if (value.has(item.value)) {
						toggleActive(component, item);

						if (++amount === value.size) {
							break;
						}
					}

				} else if (item.value === value) {
					toggleActive(component, item);
					break;
				}
			}

		} else if (active !== value) {
			ctx.setActive(value, unsetPrevious);

		} else {
			ctx.unsetActive(value);
		}

		return ctx.active;

		function toggleActive(component: bTree, item: Item) {
			const
				{block: $b} = component,
				id = ctx.values.get(item.value),
				itemEl = $b?.element('node', {id});

			if (!Object.isSet(ctx.active)) {
				return;
			}

			const
				needToAdd = !ctx.active.has(item.value);

			const res = needToAdd ?
				iActiveItems.addToActiveStore(ctx, item.value) :
				iActiveItems.removeFromActiveStorage(ctx, item.value);

			if (!res) {
				return;
			}

			$b?.setElMod(itemEl, 'node', 'active', needToAdd);

			if (needToAdd) {
				itemEl?.setAttribute('aria-selected', String(needToAdd));

				ctx.unfoldAllParents(item);

			} else {
				itemEl?.removeAttribute('aria-selected');
			}

			ctx.emit('immediateChange', ctx.active);
			ctx.emit('change', ctx.active);
		}
	}

	/** @see [[iActiveItems.prototype.initComponentValues]] */
	@hook('beforeMount')
	initComponentValues(): void {
		const
			ctx = this.top ?? this;

		this.items.forEach((item) => {
			const
				val = item.value;

			ctx.values.set(val, ctx.indexes.length);
			ctx.indexes.push(val);
			ctx.valuesToItems.set(val, item);
		});

		this.values = ctx.values;
		this.indexes = ctx.indexes;
		this.valuesToItems = ctx.valuesToItems;
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
			props = Object.reject(item, ['id', 'parentId', 'children', 'folded']);

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
			target = this.findItemNodeElement(value);

		if (!target) {
			return;
		}

		return this.block?.getElMod(target, 'node', 'folded');
	}

	/**
	 * Searches an HTML element by the specified identifier and returns it
	 * @param value
	 */
	protected findItemNodeElement(value: this['Item']['value']): CanUndef<HTMLElement> {
		const itemId = this.values.get(value);
		return this.$el?.querySelector(`[data-id="${itemId}"]`) ?? undefined;
	}

	/**
	 * Normalizes the specified items and returns it
	 *
	 * @param items
	 * @param parentId
	 */
	protected normalizeItems(items: CanUndef<this['Items']> = this.items, parentId?: string): this['Items'] {
		 const
			 normalizedItems: this['Items'] = [];

		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		items?.forEach((item, i) => {
			item.parentId ??= parentId;

			normalizedItems[i] = {...item};

			if (item.children != null) {
				normalizedItems[i].children = this.normalizeItems(item.children, item.value);
			}
		});

		return normalizedItems;
	}

	protected unfoldAllParents(item?: this['Item']): void {
		if (item?.parentId != null) {
			void this.unfold(item.parentId);

			this.unfoldAllParents(this.valuesToItems.get(item.parentId));
		}
	}

	/**
	 * Handler: fold element has been clicked
	 * @param item
	 */
	protected onFoldClick(item: Item): void {
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

		if (!target.matches(this.block?.getElSelector('item-wrapper') ?? '')) {
			return;
		}

		target = <Element>e.delegateTarget;

		const
			id = Number(target.getAttribute('data-id'));

		this.toggleActive(this.indexes[id]);
		this.emit('actionChange', this.active);
	}
}

export default bTree;
