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
import iItems, { IterationKey } from 'traits/i-items/i-items';

import iData, {

	component,
	prop,
	field,
	TaskParams,
	TaskI,
	ModsDecl,
	wait,
	system,
	computed,
	watch,
	hook

} from 'super/i-data/i-data';

import type { Active, Item, RenderFilter } from 'base/b-tree/interface';

export * from 'super/i-data/i-data';
export * from 'base/b-tree/interface';

export const
	$$ = symbolGenerator();

/**
 * Component to render tree of any elements
 */
@component({
	model: {
		prop: 'activeProp',
		event: 'onChange'
	}
})

export default class bTree extends iData implements iItems {
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

	/**
	 * An initial component active item/s value.
	 * If the component is switched to the `multiple` mode,
	 * you can pass an array or Set to define several active items values.
	 */
	@prop({required: false})
	readonly activeProp?: unknown[] | this['Active'];

	/**
	 * If true, the component supports a feature of multiple active items
	 */
	@prop(Boolean)
	readonly multiple: boolean = false;

	/** @see [[iItems.items]] */
	@field((o) => o.sync.link())
	items!: this['Items'];

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

	// /**
	//  * Map of item indexes and their values
	//  */
	// @system()
	// protected indexes!: Map<number, unknown>;
	//
	// /**
	//  * Map of item values and their indexes
	//  */
	// @system()
	// protected values!: Map<unknown, number>;

	/**
	 * An internal component active item store.
	 * If the component is switched to the `multiple` mode, the value is defined as a `Set` object.
	 *
	 * @see [[bList.activeProp]]
	 * @emits `immediateChange(active: CanArray<unknown>)`
	 */
	@system<bTree>((o) => o.sync.link((val) => {
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

	protected activeStore!: this['Active'];

	/**
	 * A link to the active item element.
	 * If the component is switched to the `multiple` mode, the getter will return an array of elements.
	 */
	@computed({
		cache: true,
		dependencies: ['active']
	})

	protected get activeElement(): CanPromise<CanUndef<CanArray<HTMLAnchorElement>>> {
		const
			{active} = this;

		const getEl = (value) => {
			if (value != null) {
				return this.block?.element<HTMLAnchorElement>('item-wrapper', {id: value});
			}
		};

		return this.waitStatus('ready', () => {
			if (this.multiple) {
				if (!Object.isSet(active)) {
					return [];
				}

				return [...active].flatMap((val) => getEl(val) ?? []);
			}

			return getEl(active);
		});
	}

	/**
	 * Returns true if the specified value is active
	 * @param value
	 */
	isActive(value: unknown): boolean {
		const
			activeStore = this.field.get('activeStore');

		if (this.multiple) {
			if (!Object.isSet(activeStore)) {
				return false;
			}

			return activeStore.has(value);
		}

		return value === activeStore;
	}

	/**
	 * A component active item/s.
	 * If the component is switched to the `multiple` mode, the getter will return a `Set` object.
	 *
	 * @see [[bList.activeStore]]
	 */
	get active(): this['Active'] {
		const
			v = this.field.get('activeStore');

		if (this.multiple) {
			return Object.isSet(v) ? new Set(v) : new Set();
		}

		return v;
	}

	/**
	 * Activates an item by the specified value.
	 * If the component is switched to the `multiple` mode, the method can take a `Set` object to set multiple items.
	 *
	 * @param value
	 * @param [unsetPrevious] - true, if needed to unset previous active items (works only with the `multiple` mode)
	 *
	 * @emits `change(active: CanArray<unknown>)`
	 * @emits `immediateChange(active: CanArray<unknown>)`
	 */
	setActive(value: this['Active'], unsetPrevious: boolean = false): boolean {
		const
			activeStore = this.field.get('activeStore');

		if (this.multiple) {
			if (!Object.isSet(activeStore)) {
				return false;
			}

			let
				res = false;

			const set = (value) => {
				if (activeStore.has(value)) {
					return;
				}

				activeStore.add(value);
				res = true;
			};

			if (Object.isSet(value)) {
				Object.forEach(value, set);

			} else {
				set(value);
			}

			// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
			if (!res) {
				return false;
			}

		} else if (activeStore === value) {
			return false;

		} else {
			this.field.set('activeStore', value);
		}

		const
			{block: $b} = this,
			elName = 'item-wrapper';

		if ($b != null) {
			const
				id = String(value),
				itemEl = $b.element(elName, {id});

			if (!this.multiple || unsetPrevious) {
				const
					previousEls = $b.elements(elName, {active: true});

				previousEls.forEach((previousEl) => {
					if (previousEl !== itemEl) {
						$b.setElMod(previousEl, elName, 'active', false);

						if (previousEl.hasAttribute('aria-selected')) {
							previousEl.setAttribute('aria-selected', 'false');
						}
					}
				});
			}

			SyncPromise.resolve(this.activeElement).then((selectedElement) => {
				const
					els = Array.concat([], selectedElement);

				els.forEach((el) => {
					$b.setElMod(el, elName, 'active', true);

					if (el.hasAttribute('aria-selected')) {
						el.setAttribute('aria-selected', 'true');
					}
				});
			}, stderr);
		}

		this.emit('immediateChange', this.active);
		this.emit('change', this.active);

		return true;
	}

	/**
	 * Deactivates an item by the specified value.
	 * If the component is switched to the `multiple` mode, the method can take a `Set` object to unset multiple items.
	 *
	 * @param value
	 * @emits `change(active: unknown)`
	 * @emits `immediateChange(active: unknown)`
	 */
	unsetActive(value: unknown): boolean {
		const
			activeStore = this.field.get('activeStore');

		const
			{activeElement} = this;

		if (this.multiple) {
			if (!Object.isSet(activeStore)) {
				return false;
			}

			let
				res = false;

			const unset = (value) => {
				if (!activeStore.has(value)) {
					return false;
				}

				activeStore.delete(value);
				res = true;
			};

			if (Object.isSet(value)) {
				Object.forEach(value, unset);

			} else {
				unset(value);
			}

			// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
			if (!res) {
				return false;
			}

		} else if (activeStore !== value) {
			return false;

		} else {
			this.field.set('activeStore', undefined);
		}

		const
			{block: $b} = this,
			elName = 'item-wrapper';

		if ($b != null) {
			SyncPromise.resolve(activeElement).then((activeElement) => {
				const
					els = Array.concat([], activeElement);

				els.forEach((el) => {
					const
						itemValue = el.getAttribute('data-id');

					const needChangeMod = this.multiple && Object.isSet(value) ?
						value.has(itemValue) :
						value === itemValue;

					if (needChangeMod) {
						$b.setElMod(el, elName, 'active', false);

						if (el.hasAttribute('aria-selected')) {
							el.setAttribute('aria-selected', 'false');
						}
					}
				});
			}, stderr);
		}

		this.emit('immediateChange', this.active);
		this.emit('change', this.active);

		return true;
	}

	/**
	 * Toggles activation of an item by the specified value.
	 * The methods return a new active component item/s.
	 *
	 * @param value
	 * @param [unsetPrevious] - true, if needed to unset previous active items (works only with the `multiple` mode)
	 */
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

	/**
	 * Returns an iterator over the tree items based on the given arguments.
	 * The iterator returns pairs of elements `[Tree item, The bTree instance associated with the element]`.
	 *
	 * @param [ctx] - a context to start iteration, the top-level tree by default
	 * @param [opts] - additional options
	 */
	traverse(
		ctx: bTree = this.top ?? this,
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

	/**
	 * Folds the specified item.
	 * If the method is called without an element passed, all tree sibling elements will be folded.
	 *
	 * @param [item]
	 */
	@wait('ready')
	fold(item?: this['Item']): Promise<boolean> {
		if (item == null) {
			const
				values: Array<Promise<boolean>> = [];

			for (const [item] of this.traverse(this, {deep: false})) {
				values.push(this.fold(item));
			}

			return SyncPromise.all(values)
				.then((res) => res.some((value) => value === true));
		}

		const
			isFolded = this.getFoldedModById(item.id) === 'true';

		if (isFolded) {
			return SyncPromise.resolve(false);
		}

		return this.toggleFold(item);
	}

	/**
	 * Unfolds the specified item.
	 * If the method is called without an element passed, all tree sibling elements will be unfolded.
	 *
	 * @param [item]
	 */
	@wait('ready')
	unfold(item?: this['Item']): Promise<boolean> {
		if (item == null) {
			const
				values: Array<Promise<boolean>> = [];

			for (const [item] of this.traverse(this, {deep: false})) {
				values.push(this.unfold(item));
			}

			return SyncPromise.all(values)
				.then((res) => res.some((value) => value === true));
		}

			const
				isUnfolded = this.getFoldedModById(item.id) === 'false';

			if (isUnfolded) {
				return SyncPromise.resolve(false);
			}

			return this.toggleFold(item);
	}

	/**
	 * Toggles the passed item fold value
	 *
	 * @param item
	 * @emits `fold(target: HTMLElement, item: `[[Item]]`, value: boolean)`
	 */
	@wait('ready')
	toggleFold(item: this['Item']): Promise<boolean> {
		const
			target = this.findItemNodeElement(item.id),
			newVal = this.getFoldedModById(item.id) === 'false';

		if (target != null && this.hasChildren(item)) {
			this.block?.setElMod(target, 'node', 'folded', newVal);
			this.emit('fold', target, item, newVal);

			return SyncPromise.resolve(true);
		}

		return SyncPromise.resolve(false);
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
	 * @param id
	 */
	protected getFoldedModById(id: string): CanUndef<string> {
		const
			target = this.findItemNodeElement(id);

		if (!target) {
			return;
		}

		return this.block?.getElMod(target, 'node', 'folded');
	}

	/**
	 * Searches an HTML element by the specified identifier and returns it
	 * @param id
	 */
	protected findItemNodeElement(id: string): CanUndef<HTMLElement> {
		const itemId = this.dom.getId(id);
		return this.$el?.querySelector(`[data-id=${itemId}]`) ?? undefined;
	}

	/**
	 * Initializes component values
	 */
	// @hook('mounted')
	protected initComponentValues(): void {
		console.log('bla')
		const
			activeStore = this.field.get('activeStore');
			// values = new Map(),
			// indexes = new Map();

		// let
		// 	i = 0;

		this.items.forEach((item) => {
			const
				{value} = item;

			if (item.active && (this.multiple ? this.activeProp === undefined : activeStore === undefined)) {
				this.setActive(value);
			}

			// const
			// 	el = this.$el?.querySelector(`[data-id=${item.value}]`);
			//
			// const classes = this.provide.elClasses({
			// 	'item-wrapper': {
			// 		id: item.value,
			// 		active: this.isActive(item.value)
			// 	}
			// });
			//
			// el?.classList.add(...classes);

			//
			// values.set(value, id);
			// indexes.set(id, value);
			//
			// if (item.children != null) {
			// 	item.children.forEach((item) => {
			// 		values.set(item.value, i);
			// 		indexes[i++] = item.value;
			// 	});
			// }
		});

		// this.values = values;
		// this.indexes = indexes;
	}

	/**
	 * Handler: fold element has been clicked
	 * @param item
	 */
	protected onFoldClick(item: Item): void {
		void this.toggleFold(item);
	}

	/**
	 * Handler: click to some item element
	 *
	 * @param e
	 * @emits `actionChange(active: this['Active'])`
	 */
	@watch({
		field: '?$el:click',
		wrapper: (o, cb) => o.dom.delegateElement('item-wrapper', cb)
	})

	protected onItemClick(e: Event): void {
		let
			target = <Element>e.target;

		if (target.matches(this.block?.getElSelector('fold') ?? '')) {
			return;
		}

		target = <Element>e.delegateTarget;

		const
			id = target.getAttribute('data-id');

		this.toggleActive(id);
		this.emit('actionChange', this.active);
	}
}
