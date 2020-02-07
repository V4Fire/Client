/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import iItem from 'traits/i-item/i-item';
import iData, { component, prop, field } from 'super/i-data/i-data';
export * from 'super/i-data/i-data';

export interface Doll extends Dictionary {
	id: string;
	parentId?: string;
	children?: Doll[];
}

@component({flyweight: true})
export default class bMatryoshka extends iData implements iItem {
	/** @see iItem.itemsProp */
	@prop(Array)
	readonly optionsProp?: Doll[] = [];

	/** @see iItem.items */
	@field((o) => o.sync.link())
	options!: Doll[];

	/** @see iItem.item */
	@prop({type: String, required: false})
	readonly option?: iItem['option'];

	/** @see iItem.itemKey */
	@prop({type: [String, Function], required: false})
	readonly optionKey?: iItem['optionKey'];

	/** @see iItem.itemProps */
	@prop({type: [Object, Function]})
	readonly optionProps: iItem['optionProps'] = {};

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
	protected get top(): this {
		return (this.isFlyweight && this.$normalParent || this) as this;
	}

	/** @override */
	protected initRemoteData(): CanUndef<Doll[]> {
		if (!this.db) {
			return;
		}

		const
			val = this.convertDBToComponent<Doll[]>(this.db);

		if (Object.isArray(val)) {
			return this.options = val;
		}

		return this.options;
	}

	/**
	 * Returns props data for the specified fold element
	 * @param el
	 */
	protected getFoldingProps(el: Doll): Dictionary {
		return {
			'@click': this.onFoldingClick.bind(this, el)
		};
	}

	/** @see iItem.getOptionKey */
	protected getOptionKey(el: unknown, i: number): CanUndef<string> {
		return iItem.getOptionKey(this, el, i);
	}

	/**
	 * Returns props data for the specified iterated element
	 *
	 * @param el
	 * @param i
	 */
	protected getOptionProps(el: Doll, i: number): Dictionary {
		const
			op = this.optionProps,
			item = Object.reject(el, 'children');

		if (!op) {
			return item;
		}

		return Object.isFunction(op) ? op(item, i, {
			key: this.getOptionKey(item, i),
			ctx: this
		}) : op;
	}

	/**
	 * Returns props data for recursive calling
	 */
	protected getNestedDollProps(): Dictionary {
		const opts = {
			folded: this.folded,
			level: this.level + 1
		};

		if (this.$listeners.fold) {
			opts['@fold'] = this.$listeners.fold;
		}

		return opts;
	}

	/**
	 * Returns a folded modifier for the specified doll identifier
	 * @param id
	 */
	protected getFoldedMod(id: string): CanUndef<string> {
		const
			target = this.searchDollElement(id);

		if (!target) {
			return;
		}

		return this.top.block.getElMod(target, 'matryoshka', 'folded');
	}

	/**
	 * Recursively render filter
	 * @param el
	 */
	protected renderFilter(el: Doll): boolean {
		return el.parentId ? this.getFoldedMod(el.parentId) === 'false' : true;
	}

	/**
	 * Searches HTML element with the specified identifier
	 * @param id
	 */
	protected searchDollElement(id: string): CanUndef<HTMLElement> {
		const dataId = this.top.dom.getId(id);
		return this.$parent?.$el?.querySelector<HTMLElement>(`[data-id=${dataId}]`) || undefined;
	}

	/**
	 * Handler: fold element click
	 *
	 * @param el
	 * @emits fold(target: HTMLElement, el: Doll, value: boolean)
	 */
	protected onFoldingClick(el: Doll): void {
		const
			target = this.searchDollElement(el.id),
			newVal = this.getFoldedMod(<string>el.id) === 'false';

		if (target) {
			this.top.block.setElMod(target, 'matryoshka', 'folded', newVal);
			this.emit('fold', target, el, newVal);
		}
	}
}
