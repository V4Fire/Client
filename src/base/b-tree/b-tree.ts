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

import { derive } from 'core/functools/trait';

import iItems, { IterationKey } from 'traits/i-items/i-items';
import iData, { component, prop, field, TaskParams, TaskI } from 'super/i-data/i-data';
import iAccess from 'traits/i-access/i-access';

import type { Item, Orientation, RenderFilter } from 'base/b-tree/interface';

export * from 'super/i-data/i-data';
export * from 'base/b-tree/interface';

export const
	$$ = symbolGenerator();

interface bTree extends Trait<typeof iAccess> {}

/**
 * Component to render tree of any elements
 */
@component()
@derive(iAccess)
class bTree extends iData implements iItems, iAccess {
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
	 * The component view orientation
	 */
	@prop(String)
	readonly orientation: Orientation = 'vertical';

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
	 * Returns a dictionary with props for the specified item
	 *
	 * @param item
	 * @param i - position index
	 */
	protected getItemProps(item: this['Item'], i: number): Dictionary {
		const
			op = this.itemProps;

		if (op == null) {
			return Object.reject(item, ['id', 'parentId', 'children', 'folded']);
		}

		return Object.isFunction(op) ?
			op(item, i, {
				key: this.getItemKey(item, i),
				ctx: this
			}) :

			op;
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

		return this.block?.getElMod(target, 'node', 'folded');
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
	 * Returns a dictionary with configurations for the v-aria directive used as a tree
	 * @param role
	 */
	protected getAriaConfig(role: 'tree'): Dictionary

	/**
	 * Returns a dictionary with configurations for the v-aria directive used as a treeitem
	 *
	 * @param role
	 * @param item - tab item data
	 * @param i - tab item position index
	 */
	protected getAriaConfig(role: 'treeitem', item: this['Item'], i: number): Dictionary

	protected getAriaConfig(role: 'tree' | 'treeitem', item?: this['Item'], i?: number): Dictionary {
		const
			getFoldedMod = this.getFoldedModById.bind(this, item?.id),
			root = () => this.top?.$el ?? this.$el;

		const toggleFold = (target: HTMLElement, value?: boolean): void => {
			const
				mod = this.block?.getElMod(target, 'node', 'folded');

			if (mod == null) {
				return;
			}

			const
				newVal = value ? value : mod === 'false';

			this.block?.setElMod(target, 'node', 'folded', newVal);
			this.emit('fold', target, item, newVal);
		};

		const treeConfig = {
			isRoot: this.top == null,
			orientation: this.orientation,
			changeEvent: (cb: Function) => {
				this.on('fold', (ctx, el, item, value) => cb(el, value));
			}
		};

		const treeitemConfig = {
			isRootFirstItem: this.top == null && i === 0,
			orientation: this.orientation,
			toggleFold,
			get rootElement() {
				return root();
			},
			get isExpanded() {
				return getFoldedMod() === 'false';
			},
			get isExpandable() {
				return item?.children != null;
			}
		};

		switch (role) {
			case 'tree': return treeConfig;
			case 'treeitem': return treeitemConfig;
			default: return {};
		}
	}

	/**
	 * Handler: fold element has been clicked
	 *
	 * @param item
	 * @emits `fold(target: HTMLElement, item:` [[Item]]`, value: boolean)`
	 */
	protected onFoldClick(item: this['Item']): void {
		const
			target = this.findItemElement(item.id),
			newVal = this.getFoldedModById(item.id) === 'false';

		if (target) {
			this.block?.setElMod(target, 'node', 'folded', newVal);
			this.emit('fold', target, item, newVal);
		}
	}
}

export default bTree;
