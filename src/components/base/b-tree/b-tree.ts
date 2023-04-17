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

import iData, { watch, hook, component, prop, system, computed, field, wait, ModsDecl } from 'components/super/i-data/i-data';
import type { Item, RenderFilter } from 'components/base/b-tree/interface';

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
class bTree extends iData implements iItems {
	/** @see [[iItems.Item]] */
	readonly Item!: Item;

	/** @see [[iItems.Items]] */
	readonly Items!: Array<this['Item']>;

	/** @see [[iActiveItems.Active]] */
	readonly Active!: iActiveItems['Active'];

	/** @see [[iActiveItems.ActiveInput]] */
	readonly ActiveInput!: iActiveItems['ActiveInput'];

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
		default(ctx: bTree, item: unknown, i: number): CanPromise<boolean> {
			if (ctx.level === 0 && i < ctx.renderChunks) {
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
	 * Link to the top-level component (internal parameter)
	 */
	@prop({type: Object, required: false})
	readonly root?: bTree;

	/**
	 * Component nesting level (internal parameter)
	 */
	@prop(Number)
	readonly level: number = 0;

	/** @see [[iActiveItems.activeProp]] */
	@prop({required: false})
	readonly activeProp?: this['ActiveInput'];

	/** @see [[iActiveItems.activeProp]] */
	@prop({required: false})
	readonly modelValue?: this['ActiveInput'];

	/** @see [[iActiveItems.multiple]] */
	@prop(Boolean)
	readonly multiple: boolean = false;

	/** @see [[iActiveItems.cancelable]] */
	@prop({type: Boolean, required: false})
	readonly cancelable?: boolean;

	/** @see [[iItems.items]] */
	get items(): this['Items'] {
		return this.field.get<this['Items']>('itemsStore') ?? [];
	}

	/** @see [[iItems.items]] */
	set items(value: this['Items']) {
		this.field.set('itemsStore', this.normalizeItems(value));
	}

	/**
	 * Stores b-tree normalized items.
	 * This store is needed because `items` property must be accessed only via get/set.
	 */
	@field<bTree>((o) => o.sync.link<Item[]>('itemsProp', (val) => {
		if (o.dataProvider != null) {
			return <CanUndef<Item[]>>o.items ?? [];
		}

		return o.normalizeItems(val);
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

	static override readonly mods: ModsDecl = {
		clickableArea: [
			['fold'],
			'any'
		]
	};

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
			root: isRootLvl ? this : this.root,
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

	/** @see [[iActiveItems.prototype.active] */
	@computed({cache: false})
	get active(): this['Active'] {
		return iActiveItems.getActive(this.root ?? this);
	}

	/** @see [[iActiveItems.prototype.activeElement] */
	get activeElement(): iActiveItems['activeElement'] {
		const
			ctx = this.root ?? this;

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

	/** @see [[DOM.getId]] */
	getDOMId(id: string): string;
	getDOMId(id: undefined | null): undefined;
	getDOMId(id: Nullable<string>): CanUndef<string> {
		return (this.root ?? this).dom.getId(Object.cast(id));
	}

	/**
	 * Returns an iterator over the tree items based on the given arguments.
	 * The iterator returns pairs of elements `[Tree item, The bTree instance associated with the element]`.
	 *
	 * @param [ctx] - a context to start iteration, the top-level tree by default
	 * @param [opts] - additional options
	 */
	traverse(
		ctx: bTree = this.root ?? this,
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
			const values: Array<Promise<boolean>> = [];

			for (const [item] of this.traverse(this, {deep: false})) {
				values.push(this.fold(item.value));
			}

			return SyncPromise.all(values)
				.then((res) => res.some((value) => value === true));
		}

		const isFolded = this.getFoldedModByValue(value) === 'true';

		if (isFolded) {
			return SyncPromise.resolve(false);
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
				ctx = this.root ?? this,
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
	toggleFold(value: this['Item']['value'], folded?: boolean): Promise<boolean> {
		const
			ctx = this.root ?? this;

		const
			oldVal = this.getFoldedModByValue(value) === 'true',
			newVal = folded ?? !oldVal;

		const
			el = ctx.findItemElement(value),
			item = this.valueItems.get(value);

		if (oldVal !== newVal && el != null && item != null && this.hasChildren(item)) {
			this.block?.setElementMod(el, 'node', 'folded', newVal);
			ctx.emit('fold', el, item, newVal);
			return SyncPromise.resolve(true);
		}

		return SyncPromise.resolve(false);
	}

	/** @see [[iActiveItems.prototype.isActive]] */
	isActive(value: this['Item']['value']): boolean {
		return iActiveItems.isActive(this.root ?? this, value);
	}

	/** @see [[iActiveItems.prototype.setActive]] */
	setActive(value: this['ActiveInput'], unsetPrevious: boolean = false): boolean {
		const
			ctx = this.root ?? this;

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
					previousNodes = $el.querySelectorAll(`.${$b.getFullElementName('node', 'active', true)}`);

				previousNodes.forEach((previousNode) => {
					const
						id = ctx.dom.restoreId(previousNode.getAttribute('data-id')),
						value = this.valueItems.get(id);

					if (!this.isActive(value)) {
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
			$b!.setElementMod(el, 'node', 'active', status);

			if (el.hasAttribute('aria-selected')) {
				el.setAttribute('aria-selected', String(status));
			}
		}
	}

	/** @see [[iActiveItems.prototype.unsetActive]] */
	unsetActive(value: this['ActiveInput']): boolean {
		const
			ctx = this.root ?? this;

		if (!iActiveItems.unsetActive(ctx, value)) {
			return false;
		}

		const {
			$el,
			block: $b
		} = ctx;

		if ($el != null && $b != null) {
			const
				previousNodes = $el.querySelectorAll(`.${$b.getFullElementName('node', 'active', true)}`);

			previousNodes.forEach((previousNode) => {
				const
					id = ctx.dom.restoreId(previousNode.getAttribute('data-id')),
					value = this.valueItems.get(id);

				if (!this.isActive(value)) {
					$b.setElementMod(previousNode, 'node', 'active', false);

					if (previousNode.hasAttribute('aria-selected')) {
						previousNode.setAttribute('aria-selected', 'false');
					}
				}
			});
		}

		return true;
	}

	/** @see [[iActiveItems.prototype.toggleActive]] */
	toggleActive(value: this['ActiveInput'], unsetPrevious?: boolean): this['Active'] {
		return iActiveItems.toggleActive(this.root ?? this, value, unsetPrevious);
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

		return this.root?.folded ?? this.folded;
	}

	/**
	 * Returns a value of the `folded` modifier from an element by the specified identifier
	 * @param value
	 */
	protected getFoldedModByValue(value: this['Item']['value']): CanUndef<string> {
		const
			target = this.findItemElement(value);

		if (target == null) {
			return;
		}

		return this.block?.getElementMod(target, 'node', 'folded');
	}

	/**
	 * Searches an HTML element by the specified item value and returns it
	 * @param value
	 */
	protected findItemElement(value: this['Item']['value']): HTMLElement | null {
		const
			ctx = this.root ?? this,
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

		if (this.root == null) {
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
			Object.defineProperty(this, 'indexes', {
				enumerable: true,
				configurable: true,
				get: () => this.root?.indexes
			});

			Object.defineProperty(this, 'valueIndexes', {
				enumerable: true,
				configurable: true,
				get: () => this.root?.valueIndexes
			});

			Object.defineProperty(this, 'valueItems', {
				enumerable: true,
				configurable: true,
				get: () => this.root?.valueItems
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
	 * Normalizes the specified items and returns it
	 * @param [items]
	 */
	protected normalizeItems(items: this['Items'] = []): this['Items'] {
		const
			that = this;

		let
			i = -1;

		items = Object.fastClone(items);
		items.forEach((el) => normalize(el));

		return items;

		function normalize(item: bTree['Item'], parentValue?: unknown) {
			i++;

			if (item.value === undefined) {
				item.value = i;
			}

			if (!('parentValue' in item)) {
				item.parentValue = parentValue;

				if (Object.isArray(item.children)) {
					if (that.isActive(item.value)) {
						item.folded = false;
					}

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

		const
			ctx = this.root ?? this;

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
