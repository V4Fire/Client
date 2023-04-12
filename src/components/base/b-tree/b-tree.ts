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

import SyncPromise from 'core/promise/sync';
import AsyncRender, { iterate, TaskOptions } from 'components/friends/async-render';

import iItems, { IterationKey } from 'components/traits/i-items/i-items';

import iData, { component, prop, field, wait, ModsDecl } from 'components/super/i-data/i-data';
import type { Item, RenderFilter } from 'components/base/b-tree/interface';
import Block, { getElementMod } from 'components/friends/block';

export * from 'components/super/i-data/i-data';
export * from 'components/base/b-tree/interface';

AsyncRender.addToPrototype({iterate});
Block.addToPrototype({getElementMod});

@component({
	functional: {
		dataProvider: undefined
	}
})

export default class bTree extends iData implements iItems {
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
	 * Link to the top level component (internal parameter)
	 */
	@prop({type: Object, required: false})
	readonly top?: bTree;

	/**
	 * Component nesting level (internal parameter)
	 */
	@prop(Number)
	readonly level: number = 0;

	/** @see [[iItems.items]] */
	@field((o) => o.sync.link())
	items!: this['Items'];

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
			top: isRootLvl ? this : this.top,
			classes: this.classes,
			renderChunks: this.renderChunks,
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
			target = this.findItemElement(item.id),
			newVal = this.getFoldedModById(item.id) === 'false';

		if (target != null && this.hasChildren(item)) {
			this.block?.setElementMod(target, 'node', 'folded', newVal);
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
			target = this.findItemElement(id);

		if (!target) {
			return;
		}

		return this.block?.getElementMod(target, 'node', 'folded');
	}

	/**
	 * Searches an HTML element by the specified identifier and returns it
	 * @param id
	 */
	protected findItemElement(id: string): CanUndef<HTMLElement> {
		const itemId = this.dom.getId(id);
		return this.$el?.querySelector(`[data-id=${itemId}]`) ?? undefined;
	}

	/**
	 * Handler: fold element has been clicked
	 * @param item
	 */
	protected onFoldClick(item: this['Item']): void {
		void this.toggleFold(item);
	}
}
