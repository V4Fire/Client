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

import symbolGenerator from 'core/symbol';

import iItems from 'traits/i-items/i-items';
import { TreeItem } from 'base/b-tree/interface';
import iData, { component, prop, field } from 'super/i-data/i-data';

export * from 'super/i-data/i-data';
export * from 'base/b-tree/interface';

export const
	$$ = symbolGenerator();

/**
 * Component to render tree of any elements
 */
@component({flyweight: true})
export default class bTree extends iData implements iItems {
	/** @see [[iItems.prototype.optionsProp]] */
	@prop(Array)
	readonly optionsProp?: TreeItem[] = [];

	/** @see [[iItems.prototype.options]] */
	@field((o) => o.sync.link())
	options!: TreeItem[];

	/** @see [[iItems.prototype.option]] */
	@prop({type: [String, Function], required: false})
	readonly option?: iItems['option'];

	/** @see [[iItems.prototype.optionKey]] */
	@prop({type: [String, Function], required: false})
	readonly optionKey?: iItems['optionKey'];

	/** @see [[iItems.prototype.optionProps]] */
	@prop({type: Function, required: false})
	readonly optionProps!: iItems['optionProps'];

	/**
	 * Common filter function for the asyncRender
	 *
	 * @see [[AsyncRender.iterate]]
	 * @see [[TaskFilter]]
	 */
	@prop(
		{
			type: Function,
			required: false,
			default(this: bTree): Promise<boolean> {
				return this.async.animationFrame().then(() => true);
			}
		}
	)

	readonly renderFilter!: (ctx: bTree, el: TreeItem) => CanPromise<boolean>;

	/**
	 * Filter function for nested items
	 *
	 * @see [[AsyncRender.iterate]]
	 * @see [[TaskFilter]]
	 */
	@prop({type: Function, required: false})
	readonly nestedRenderFilter?: (ctx: bTree, el: TreeItem) => CanPromise<boolean>;

	/**
	 * Number of chunks for the async render
	 */
	@prop(Number)
	readonly renderChunks: number = 5;

	/**
	 * If true, then all nested elements will be folded by default
	 */
	@prop(Boolean)
	readonly folded: boolean = true;

	/**
	 * Component level (internal parameter)
	 */
	@prop(Number)
	readonly level: number = 0;

	/**
	 * Link to the top level component
	 */
	protected get top(): bTree {
		return this.isFlyweight ? <bTree>this.$normalParent : this;
	}

	/** @override */
	protected initRemoteData(): CanUndef<this['options']> {
		if (!this.db) {
			return;
		}

		const
			val = this.convertDBToComponent<this['options']>(this.db);

		if (Object.isArray(val)) {
			return this.options = val;
		}

		return this.options;
	}

	/**
	 * Returns props data for the specified fold element
	 * @param el
	 */
	protected getFoldingProps(el: TreeItem): Dictionary {
		return {
			'@click': this.onFoldingClick.bind(this, el)
		};
	}

	/** @see [[iItems.getItemKey]] */
	protected getOptionKey(el: unknown, i: number): CanUndef<string> {
		return iItems.getItemKey(this, el, i);
	}

	/**
	 * Returns props data for the specified iterated element
	 *
	 * @param el
	 * @param i
	 */
	protected getOptionProps(el: TreeItem, i: number): Dictionary {
		const
			op = this.optionProps,
			item = Object.reject(el, 'children');

		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (op == null) {
			return item;
		}

		return Object.isFunction(op) ?
			op(item, i, {
				key: this.getOptionKey(item, i),
				ctx: this
			}) :
			op;
	}

	/**
	 * Returns props data for recursive calling
	 */
	protected getNestedItemProps(): Dictionary {
		const
			renderFilter = Object.isFunction(this.nestedRenderFilter) ? this.nestedRenderFilter : this.renderFilter;

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
	 * @emits fold(target: HTMLElement, el: TreeItem, value: boolean)
	 */
	protected onFoldingClick(el: TreeItem): void {
		const
			target = this.searchItemElement(el.id),
			newVal = this.getFoldedMod(el.id) === 'false';

		if (target) {
			this.top.block?.setElMod(target, 'node', 'folded', newVal);
			this.emit('fold', target, el, newVal);
		}
	}
}
