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
@component({flyweight: true})
export default class bTree extends iData implements iItems {
	/** @see [[iItems.itemsProp]] */
	@prop(Array)
	readonly itemsProp: Item[] = [];

	/** @see [[iItems.item]] */
	@prop({type: [String, Function], required: false})
	readonly item?: iItems['item'];

	/** @see [[iItems.itemKey]] */
	@prop({type: [String, Function], required: false})
	readonly itemKey?: iItems['itemKey'];

	/** @see [[iItems.itemProps]] */
	@prop({type: Function, required: false})
	readonly itemProps!: iItems['itemProps'];

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
		default(this: bTree): Promise<boolean> {
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
	 * Component nesting level (internal parameter)
	 */
	@prop(Number)
	readonly level: number = 0;

	/** @see [[iItems.items]] */
	@field((o) => o.sync.link())
	items!: Item[];

	/**
	 * Link to the top level component
	 */
	protected get top(): bTree {
		return this.isFlyweight ? <bTree>this.$normalParent : this;
	}

	/**
	 * Properties for recursively inserted tree components
	 */
	protected get nestedTreeProps(): Dictionary {
		const
			renderFilter = Object.isFunction(this.nestedRenderFilter) ? this.nestedRenderFilter : this.top.renderFilter;

		const opts = {
			folded: this.folded,
			level: this.level + 1,
			classes: this.classes,
			renderFilter
		};

		if (this.$listeners.fold) {
			opts['@fold'] = this.$listeners.fold;
		}

		return opts;
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
	 * Returns props data for the specified fold element
	 * @param el
	 */
	protected getFoldProps(el: Item): Dictionary {
		return {
			'@click': this.onFoldClick.bind(this, el)
		};
	}

	/** @see [[iItems.getItemKey]] */
	protected getItemKey(el: unknown, i: number): CanUndef<string> {
		return iItems.getItemKey(this, el, i);
	}

	/**
	 * Returns props data for the specified iterated element
	 *
	 * @param el
	 * @param i
	 */
	protected getItemProps(el: Item, i: number): Dictionary {
		const
			op = this.itemProps,
			item = Object.reject(el, 'children');

		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
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
	 * Returns a folded modifier for the specified identifier
	 * @param id
	 */
	protected getFoldedMod(id: string): CanUndef<string> {
		const
			target = this.searchItemElement(id);

		if (!target) {
			return;
		}

		return this.top.block?.getElMod(target, 'node', 'folded');
	}

	/**
	 * Searches HTML element with the specified identifier
	 * @param id
	 */
	protected searchItemElement(id: string): CanUndef<HTMLElement> {
		const itemId = this.top.dom.getId(id);
		return this.$parent?.$el?.querySelector<HTMLElement>(`[data-id=${itemId}]`) ?? undefined;
	}

	/**
	 * Handler: fold element click
	 *
	 * @param el
	 * @emits fold(target: HTMLElement, el: Item, value: boolean)
	 */
	protected onFoldClick(el: Item): void {
		const
			target = this.searchItemElement(el.id),
			newVal = this.getFoldedMod(el.id) === 'false';

		if (target) {
			this.top.block?.setElMod(target, 'node', 'folded', newVal);
			this.emit('fold', target, el, newVal);
		}
	}
}
