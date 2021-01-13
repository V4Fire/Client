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

import iItems from 'traits/i-items/i-items';
import iData, { component, prop, field } from 'super/i-data/i-data';
import { Item, RenderFilter } from 'base/b-tree/interface';

export * from 'super/i-data/i-data';
export * from 'base/b-tree/interface';

export const
	$$ = symbolGenerator();

/**
 * Component to render tree of any elements
 */
@component()
export default class bTree extends iData implements iItems {
	/** @see [[iItems.Item]] */
	readonly Item!: Item;

	/** @see [[iItems.Items]] */
	readonly Items!: Item[];

	/** @see [[iItems.itemsProp]] */
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
	 * Common filter to render items via `asyncRender`.
	 * It is used to optimize the process of rendering items.
	 *
	 * @see [[AsyncRender.iterate]]
	 * @see [[TaskFilter]]
	 */
	@prop({
		type: Function,
		required: false,
		default(this: bTree, el: unknown, i: number): CanPromise<boolean> {
			if (this.level === 0 && i < this.renderChunks) {
				return true;
			}

			return this.async.animationFrame().then(() => true);
		}
	})

	readonly renderFilter!: RenderFilter;

	/**
	 * Filter to render nested items via `asyncRender`.
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
	items!: Item[];

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
	protected getItemKey(el: unknown, i: number): CanUndef<string> {
		return iItems.getItemKey(this, el, i);
	}

	/** @override */
	protected initRemoteData(): CanUndef<this['items']> {
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
	 * Returns a dictionary with props for the specified element
	 *
	 * @param el
	 * @param i - position index
	 */
	protected getItemProps(el: Item, i: number): Dictionary {
		const
			op = this.itemProps,
			item = Object.reject(el, 'children');

		if (op == null) {
			return item;
		}

		return Object.isFunction(op) ?
			op(item, i, {
				key: this.getItemKey(item, i),
				ctx: this
			}) :

			op;
	}

	/**
	 * Returns a dictionary with props for the specified fold element
	 * @param el
	 */
	protected getFoldProps(el: Item): Dictionary {
		return {
			'@click': this.onFoldClick.bind(this, el)
		};
	}

	/**
	 * Returns a value of the `folded` property from the specified item
	 * @param el
	 */
	protected getFoldedPropValue(el: this['Item']): boolean {
		if (el.folded != null) {
			return el.folded;
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
		return this.$parent?.$el?.querySelector<HTMLElement>(`[data-id=${itemId}]`) ?? undefined;
	}

	/**
	 * Handler: fold element click
	 *
	 * @param el
	 * @emits `fold(target: HTMLElement, el: Item, value: boolean)`
	 */
	protected onFoldClick(el: Item): void {
		const
			target = this.findItemElement(el.id),
			newVal = this.getFoldedModById(el.id) === 'false';

		if (target) {
			this.block?.setElMod(target, 'node', 'folded', newVal);
			this.emit('fold', target, el, newVal);
		}
	}
}
